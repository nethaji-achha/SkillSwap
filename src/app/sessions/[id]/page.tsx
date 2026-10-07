'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { sessionService } from '@/services/session.service';
import { skillService } from '@/services/skill.service';
import { LearningSession, SessionSummaryItem, SkillAssessmentItem } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { ReviewSessionModal } from '@/components/modals/ReviewSessionModal';
import { SessionSummaryModal } from '@/components/modals/SessionSummaryModal';
import { SkillAssessmentModal } from '@/components/modals/SkillAssessmentModal';
import { 
  Calendar, 
  Clock, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  CheckCircle2, 
  ArrowLeft, 
  Coins,
  ShieldCheck,
  Loader2,
  XCircle,
  Sparkles,
  Award,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import Link from 'next/link';

export default function SessionDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, cancelSession, completeSession, showToast } = useSkillSwap();
  
  const sessionId = params.id as string;
  const [session, setSession] = useState<LearningSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [inCall, setInCall] = useState<boolean>(searchParams.get('join') === 'true');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'reconnecting' | 'failed'>('idle');
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummaryItem | null>(null);
  const [assessment, setAssessment] = useState<SkillAssessmentItem | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [completing, setCompleting] = useState(false);

  // WebRTC refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const data = await sessionService.getSessionById(sessionId);
      setSession(data);

      if (data.status === 'completed') {
        // Fetch summary if available
        try {
          const sm = await sessionService.getSessionSummary(sessionId);
          setSessionSummary(sm);
        } catch {}

        // Fetch assessment if available
        try {
          const assessments = await skillService.getMyAssessments();
          const match = assessments.find(a => a.session_id === sessionId || a.skill_name.toLowerCase() === data.skillName.toLowerCase());
          if (match) {
            setAssessment(match);
          }
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load session details', err);
    } finally {
      setLoading(false);
    }
  };

  // WebRTC Setup when entering call
  useEffect(() => {
    if (inCall && session) {
      startWebRTC();
    } else {
      cleanupWebRTC();
    }

    return () => {
      cleanupWebRTC();
    };
  }, [inCall, session?.id]);

  const startWebRTC = async () => {
    setConnectionStatus('connecting');
    try {
      // 1. Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).catch(err => {
        console.warn('Camera/Mic access denied or unavailable, attempting audio only', err);
        return navigator.mediaDevices.getUserMedia({ video: false, audio: true }).catch(() => null);
      });

      if (stream) {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }

      // 2. Initialize RTCPeerConnection with STUN servers
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      peerConnectionRef.current = pc;

      // Add local tracks to peer connection
      if (stream) {
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
      }

      // Handle remote tracks
      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setConnectionStatus('connected');
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          setConnectionStatus('connected');
        } else if (pc.iceConnectionState === 'disconnected') {
          setConnectionStatus('reconnecting');
        } else if (pc.iceConnectionState === 'failed') {
          setConnectionStatus('failed');
        }
      };

      // 3. Connect Signaling WebSocket
      const token = typeof window !== 'undefined' ? localStorage.getItem('skillswap_token') || '' : '';
      const host = window.location.hostname;
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${host}:8000/api/v1/sessions/ws/${sessionId}?token=${token}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate
          }));
        }
      };

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'ready' }));
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.type === 'peer-joined' || msg.type === 'ready') {
            // Initiate offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'offer', sdp: offer }));
            }
          } else if (msg.type === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'answer', sdp: answer }));
            }
          } else if (msg.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          } else if (msg.type === 'ice-candidate') {
            if (msg.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(msg.candidate)).catch(() => {});
            }
          }
        } catch (err) {
          console.error('Signaling message error:', err);
        }
      };

      ws.onerror = () => {
        setConnectionStatus('failed');
      };

    } catch (err) {
      console.error('WebRTC initialization error:', err);
      setConnectionStatus('failed');
    }
  };

  const cleanupWebRTC = () => {
    if (wsRef.current) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'leave' }));
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setConnectionStatus('idle');
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isMicOn;
      });
      setIsMicOn(!isMicOn);
    } else {
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoOn;
      });
      setIsVideoOn(!isVideoOn);
    } else {
      setIsVideoOn(!isVideoOn);
    }
  };

  const handleEndCall = () => {
    cleanupWebRTC();
    setInCall(false);
    showToast('Meeting ended. Please rate your learning experience.');
    setIsReviewModalOpen(true);
  };

  const handleCompleteSession = async () => {
    if (!session) return;
    try {
      setCompleting(true);
      await sessionService.completeSession(session.id);
      showToast('Session marked completed! Bronze badge awarded & Assessment scheduled.');
      await fetchSessionDetails();
      setIsSummaryModalOpen(true);
    } catch (err: any) {
      showToast(err?.message || 'Failed to complete session');
    } finally {
      setCompleting(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this session? Escrow tokens will be refunded to the learner.')) return;
    setCancelling(true);
    try {
      await cancelSession(session!.id);
      setSession({ ...session!, status: 'cancelled' });
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-blue" />
        Loading session details...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto space-y-4">
        <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Session not found</h2>
        <p className="text-xs text-slate-500">This session may have been removed or does not exist.</p>
        <Link
          href="/sessions"
          className="inline-block px-4 py-2 bg-gradient-to-r from-brand-green to-brand-blue text-white font-semibold text-xs rounded-xl shadow-sm"
        >
          Back to Sessions
        </Link>
      </div>
    );
  }

  const isTeacher = session.teacherId === user?.id;
  const partnerName = isTeacher ? session.learnerName : session.teacherName;
  const partnerAvatar = isTeacher ? session.learnerAvatar : session.teacherAvatar;

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/sessions"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Sessions</span>
          </Link>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${
              session.status === 'scheduled' || session.status === 'in_progress'
                ? 'bg-brand-blue/10 text-brand-blue-dark border-brand-blue/20'
                : session.status === 'completed'
                ? 'bg-brand-green/10 text-brand-green-dark border-brand-green/30'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {session.status}
          </span>
        </div>

        {/* Live Interactive WebRTC Call Room */}
        {inCall ? (
          <div className="bg-slate-950 rounded-3xl p-6 text-white shadow-2xl space-y-6 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-green animate-ping" />
                  <h3 className="font-bold text-lg">{session.skillName} Live Exchange</h3>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                  <span>{session.durationMinutes}m duration</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {connectionStatus === 'connected' ? (
                      <span className="text-brand-green flex items-center gap-1 font-semibold">
                        <Wifi className="w-3.5 h-3.5" /> WebRTC Connected
                      </span>
                    ) : connectionStatus === 'connecting' ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Connecting to peer...
                      </span>
                    ) : connectionStatus === 'reconnecting' ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Reconnecting...
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <WifiOff className="w-3.5 h-3.5" /> Direct Call Active
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <button
                onClick={handleEndCall}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Leave Call</span>
              </button>
            </div>

            {/* Video Streams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-80">
              {/* Remote Participant Stream */}
              <div className="bg-slate-900 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden border border-slate-800">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover rounded-2xl"
                />
                {/* Fallback overlay if remote stream not yet streaming video */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 pointer-events-none -z-0">
                  <Avatar src={partnerAvatar} name={partnerName} size="xl" />
                  <span className="mt-3 font-semibold text-sm text-slate-200">{partnerName}</span>
                  <span className="text-[10px] text-slate-400">{isTeacher ? 'Learner' : 'Teacher'}</span>
                </div>
              </div>

              {/* Local User Stream */}
              <div className="bg-slate-900 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden border border-slate-800">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover rounded-2xl ${isVideoOn ? 'block' : 'hidden'}`}
                />
                {!isVideoOn && (
                  <div className="flex flex-col items-center justify-center">
                    <Avatar src={user?.avatar || ''} name={user?.name || 'You'} size="xl" />
                    <span className="mt-3 font-semibold text-sm text-slate-200">{user?.name || 'You'} (You)</span>
                    <span className="text-[10px] text-slate-400">{isTeacher ? 'Teacher' : 'Learner'}</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-950/70 rounded text-[10px] text-slate-300">
                  You {isMicOn ? '🎙️' : '🔇'}
                </div>
              </div>
            </div>

            {/* Call Controls Bar */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={toggleMic}
                className={`p-3 rounded-xl transition ${isMicOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'}`}
                title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-xl transition ${isVideoOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'}`}
                title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>
          </div>
        ) : (
          /* Session Overview Card */
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${isTeacher ? 'text-brand-green-dark' : 'text-brand-blue-dark'}`}>
                  {isTeacher ? '👨‍🏫 You are Teaching' : '🎓 You are Learning'}
                </span>
                <h1 className="text-2xl font-black text-slate-900 mt-1">{session.skillName} Mentorship</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Scheduled for {new Date(session.scheduledAt).toLocaleString()} ({session.durationMinutes} mins)
                </p>
              </div>

              {session.status === 'scheduled' && (
                <button
                  onClick={() => setInCall(true)}
                  className="px-6 py-3 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs rounded-xl shadow-md shadow-brand-green/20 transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Live Video Session</span>
                </button>
              )}
            </div>

            {/* Partner Details & Escrow Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-3.5">
                <Avatar src={partnerAvatar} name={partnerName} size="lg" />
                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">{isTeacher ? 'Student / Learner' : 'Teacher / Mentor'}</p>
                  <h4 className="font-bold text-slate-900 text-base">{partnerName}</h4>
                  <Link href={`/profile/${isTeacher ? session.learnerId : session.teacherId}`} className="text-xs text-brand-blue font-semibold hover:underline">
                    View Profile →
                  </Link>
                </div>
              </div>

              <div className="bg-brand-orange/5 rounded-2xl p-4 border border-brand-orange/20 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-blue" />
                    Token Escrow Protected
                  </span>
                  <span className="font-black text-brand-orange-dark text-base">{session.tokenPrice} 🪙</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-2">
                  {session.status === 'completed'
                    ? 'Tokens released to teacher.'
                    : session.status === 'cancelled'
                    ? 'Tokens refunded back to learner.'
                    : 'Held in secure escrow. Tokens will be released upon session completion.'}
                </p>
              </div>
            </div>

            {/* Objective */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Session Objective</h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                {session.objective || 'Complete hands-on exercises and review code architecture.'}
              </p>
            </div>

            {/* Post-Completion Artifacts (Summary & Assessment) */}
            {session.status === 'completed' && (
              <div className="p-5 bg-gradient-to-r from-brand-blue/5 via-brand-green/5 to-transparent rounded-2xl border border-brand-blue/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-blue" />
                    <h3 className="font-bold text-slate-900 text-sm">Post-Session Learning Outcomes</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Bronze Awarded
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Summary Card */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <span className="text-[11px] font-bold text-slate-800 block">AI Learning Summary</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Detailed key concepts, practical tips, discussed questions, and revision takeaways.
                    </p>
                    <button
                      onClick={() => setIsSummaryModalOpen(true)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
                    >
                      View Session Summary
                    </button>
                  </div>

                  {/* Assessment Card */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800">Skill Assessment</span>
                      {assessment?.status === 'completed' ? (
                        <span className="text-[10px] font-bold text-brand-green-dark">Graded ({assessment.percentage}%)</span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700">Scheduled</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      5-question quiz to upgrade your badge to Silver (60%+) or Gold (80%+).
                    </p>
                    <button
                      onClick={() => {
                        if (assessment) {
                          setIsAssessmentModalOpen(true);
                        } else {
                          showToast('Assessment scheduled. Unlocks 2 days after session.');
                        }
                      }}
                      className="w-full py-2 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white font-bold text-xs rounded-lg shadow-sm transition"
                    >
                      {assessment?.status === 'completed' ? 'Review Assessment Results' : 'Take Skill Assessment'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions: Complete, Cancel */}
            {session.status === 'scheduled' && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Session & Refund Escrow
                </button>

                <button
                  onClick={handleCompleteSession}
                  disabled={completing}
                  className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Mark Completed & Release 🪙
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ReviewSessionModal
        session={session}
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSession({ ...session, status: 'completed' });
        }}
      />

      <SessionSummaryModal
        sessionId={session.id}
        summary={sessionSummary}
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
      />

      {assessment && (
        <SkillAssessmentModal
          assessmentId={assessment.id}
          isOpen={isAssessmentModalOpen}
          onClose={() => setIsAssessmentModalOpen(false)}
          onCompleted={() => fetchSessionDetails()}
        />
      )}
    </>
  );
}

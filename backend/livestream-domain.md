# DOMAIN: LIVESTREAM

```
├── livestream/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── LiveStreamSession.java          # Aggregate root
│   │   │   │   # {id, companyId, hostUserId,
│   │   │   │   #  title, description, thumbnailUrl,
│   │   │   │   #  sessionType (JOB_FAIR | INTERVIEW),
│   │   │   │   #  status (SCHEDULED→LIVE→ENDED→CANCELLED),
│   │   │   │   #  scheduledAt, startedAt, endedAt,
│   │   │   │   #  maxViewers, viewerCount,
│   │   │   │   #  quotaConsumed, interviewSlots[]}
│   │   │   │
│   │   │   ├── StreamParticipant.java          # Entity
│   │   │   │   # {id, sessionId, userId,
│   │   │   │   #  role (HOST | CO_HOST | SPEAKER | VIEWER),
│   │   │   │   #  joinedAt, leftAt, inviteStatus}
│   │   │   │
│   │   │   ├── StreamEvent.java                # Entity (timeline event log)
│   │   │   │   # {id, sessionId, type, payload, occurredAt}
│   │   │   │   # type: CHAT | Q_AND_A | POLL | JOB_SPOTLIGHT
│   │   │   │   #       | APPLY_CTA | INTERVIEW_INVITE | SYSTEM
│   │   │   │
│   │   │   ├── StreamRecording.java            # Entity
│   │   │   │   # {id, sessionId, recordingUrl, duration,
│   │   │   │   #  transcriptText, aiSummary,
│   │   │   │   #  topQuestions[], keyTopics[],
│   │   │   │   #  aiSummaryStatus (PENDING|PROCESSING|DONE)}
│   │   │   │
│   │   │   ├── StreamAnalytics.java            # Entity
│   │   │   │   # {id, sessionId, peakViewerCount,
│   │   │   │   #  avgWatchTimeSeconds, totalWatchSeconds,
│   │   │   │   #  applyClickCount, cvViewCount,
│   │   │   │   #  pollResponseCount, qaQuestionCount,
│   │   │   │   #  dropOffHeatmap (List<HeatmapPoint>)}
│   │   │   │
│   │   │   ├── InterviewSlot.java              # Value object (trong Session)
│   │   │   │   # {slotId, startTime, durationMinutes,
│   │   │   │   #  assignedCandidateId?, status (OPEN|BOOKED|DONE)}
│   │   │   │
│   │   │   └── vo/
│   │   │       ├── SessionType.java            # Enum: JOB_FAIR, INTERVIEW
│   │   │       ├── SessionStatus.java          # Enum + transition rules
│   │   │       ├── ParticipantRole.java        # Enum: HOST, CO_HOST, SPEAKER, VIEWER
│   │   │       └── HeatmapPoint.java           # {second, viewerCount}
│   │   │
│   │   ├── repository/
│   │   │   ├── LiveStreamSessionRepository.java
│   │   │   ├── StreamEventRepository.java
│   │   │   ├── StreamRecordingRepository.java
│   │   │   └── StreamAnalyticsRepository.java
│   │   │
│   │   └── service/
│   │       ├── SessionDomainService.java
│   │       │   # canStart(session) — check SCHEDULED + quotaOk
│   │       │   # canSpotlightJob(session, jobPostId) — check job thuộc company
│   │       │   # allocateInterviewSlot(session, candidateId) → InterviewSlot
│   │       │   # transition(session, newStatus) — enforce state machine
│   │       │
│   │       └── StreamQuotaDomainService.java
│   │           # checkStreamQuota(companyId) → boolean
│   │           # consumeStreamQuota(companyId)
│   │
│   ├── application/
│   │   ├── usecase/
│   │   │   ├── employer/
│   │   │   │   ├── CreateLiveStreamSessionUseCase.java
│   │   │   │   │   # check quota → tạo session SCHEDULED → publish SessionCreatedEvent
│   │   │   │   ├── UpdateSessionUseCase.java
│   │   │   │   ├── StartLiveStreamUseCase.java
│   │   │   │   │   # lấy WHIP ingest URL từ MediaServerPort
│   │   │   │   │   # → status = LIVE → publish SessionStartedEvent
│   │   │   │   ├── EndLiveStreamUseCase.java
│   │   │   │   │   # status = ENDED → trigger recording + AI batch
│   │   │   │   ├── SpotlightJobPostUseCase.java
│   │   │   │   │   # tạo JOB_SPOTLIGHT StreamEvent → push qua WS
│   │   │   │   ├── CreatePollUseCase.java
│   │   │   │   ├── AnswerQAUseCase.java
│   │   │   │   ├── InviteCandidateToSlotUseCase.java
│   │   │   │   │   # tạo WebRTC room → INTERVIEW_INVITE StreamEvent
│   │   │   │   │   # → notify candidate
│   │   │   │   ├── GetMySessionsUseCase.java
│   │   │   │   └── GetSessionAnalyticsUseCase.java
│   │   │   │
│   │   │   └── candidate/
│   │   │       ├── JoinLiveStreamUseCase.java
│   │   │       │   # lấy WHEP playback URL → tạo StreamParticipant VIEWER
│   │   │       ├── LeaveStreamUseCase.java
│   │   │       ├── SubmitQAQuestionUseCase.java
│   │   │       ├── RespondToPollUseCase.java
│   │   │       ├── ApplyFromStreamUseCase.java
│   │   │       │   # gọi SubmitApplicationUseCase với context=STREAM
│   │   │       ├── AcceptInterviewInviteUseCase.java
│   │   │       ├── GetUpcomingStreamsUseCase.java  # marketplace
│   │   │       └── GetStreamReplayUseCase.java
│   │   │           # trả về recordingUrl (CDN) + aiSummary + apply CTA
│   │   │
│   │   └── port/
│   │       └── out/
│   │           ├── MediaServerPort.java
│   │           │   # createRoom(sessionId) → {ingestUrl, playbackUrl}
│   │           │   # createWebRTCRoom(slotId) → {hostUrl, guestUrl}
│   │           │   # endRoom(sessionId)
│   │           │   # getRecordingUrl(sessionId) → String
│   │           │
│   │           ├── StreamStoragePort.java
│   │           │   # storeRecording(sessionId, sourceUrl) → cdnUrl
│   │           │
│   │           ├── AITranscriptPort.java
│   │           │   # transcribe(recordingUrl) → String (raw transcript)
│   │           │   # summarize(transcript, sessionContext) → AISummaryResult
│   │           │   #   AISummaryResult: {summary, topQuestions[], keyTopics[]}
│   │           │
│   │           └── StreamQuotaServicePort.java
│   │               # Interface gọi sang subscription domain
│   │               # checkAndConsumeStreamQuota(companyId) → boolean
│   │
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── entity/
│   │   │   │   ├── LiveStreamSessionJpaEntity.java
│   │   │   │   ├── StreamParticipantJpaEntity.java
│   │   │   │   ├── StreamEventJpaEntity.java
│   │   │   │   ├── StreamRecordingJpaEntity.java
│   │   │   │   └── StreamAnalyticsJpaEntity.java
│   │   │   ├── repository/
│   │   │   │   ├── LiveStreamSessionJpaRepository.java
│   │   │   │   └── StreamEventJpaRepository.java
│   │   │   ├── adapter/
│   │   │   │   ├── LiveStreamSessionRepositoryAdapter.java
│   │   │   │   └── StreamEventRepositoryAdapter.java
│   │   │   └── mapper/
│   │   │       └── LiveStreamMapper.java
│   │   │
│   │   ├── media/
│   │   │   ├── LiveKitMediaServerAdapter.java  # implements MediaServerPort
│   │   │   │   # LiveKit SDK: createRoom, generateToken (WHIP/WHEP)
│   │   │   │   # Fallback option: AgoraMediaServerAdapter.java
│   │   │   └── LiveKitWebhookHandler.java
│   │   │       # Nhận webhook từ LiveKit khi room ended
│   │   │       # → trigger EndLiveStreamUseCase
│   │   │
│   │   ├── storage/
│   │   │   └── S3StreamStorageAdapter.java     # implements StreamStoragePort
│   │   │       # Download recording từ LiveKit → upload S3 → CloudFront URL
│   │   │
│   │   ├── ai/
│   │   │   └── WhisperLLMTranscriptAdapter.java  # implements AITranscriptPort
│   │   │       # OpenAI Whisper API → transcript text
│   │   │       # → LLMPort.complete(summarizePrompt) → AISummaryResult
│   │   │
│   │   ├── subscription/
│   │   │   └── SubscriptionStreamQuotaAdapter.java  # implements StreamQuotaServicePort
│   │   │       # Gọi CheckQuotaUseCase + ConsumeQuotaUseCase từ subscription domain
│   │   │
│   │   ├── batch/
│   │   │   └── StreamAISummaryBatchJob.java    # Spring Batch
│   │   │       # Chạy async sau khi session ENDED
│   │   │       # transcribe → summarize → update StreamRecording
│   │   │
│   │   └── event/
│   │       ├── SessionStartedEventHandler.java
│   │       │   # Lắng nghe → push WS "session_started" broadcast
│   │       ├── SessionEndedEventHandler.java
│   │       │   # Lắng nghe → trigger AI batch job
│   │       └── StreamEventWsPusher.java
│   │           # Lắng nghe StreamEvent (poll, Q&A, spotlight) → push WS realtime
│   │
│   └── presentation/
│       ├── EmployerStreamController.java       # /api/streams (CRUD + start/end)
│       ├── CandidateStreamController.java      # /api/streams (join, replay, apply)
│       ├── StreamMarketplaceController.java    # /api/streams/upcoming (public)
│       ├── StreamWebhookController.java        # /webhooks/livekit (LiveKit callback)
│       └── dto/
│           ├── request/
│           │   ├── CreateSessionRequest.java   # {title, type, scheduledAt, interviewSlots[]}
│           │   ├── SpotlightJobRequest.java    # {jobPostId}
│           │   ├── CreatePollRequest.java      # {question, options[]}
│           │   └── InviteToSlotRequest.java    # {candidateId, slotId}
│           └── response/
│               ├── SessionResponse.java        # list view
│               ├── SessionDetailResponse.java  # employer dashboard
│               ├── SessionJoinResponse.java    # {playbackUrl, participantToken}
│               ├── SessionReplayResponse.java  # {videoUrl, aiSummary, applyCTA}
│               └── SessionAnalyticsResponse.java
```

---

## Shared Events bổ sung (thêm vào shared/event/)

```
shared/event/
└── livestream/
    ├── SessionCreatedEvent.java
    │   # {sessionId, companyId, scheduledAt, sessionType}
    ├── SessionStartedEvent.java
    │   # {sessionId, companyId, startedAt}
    ├── SessionEndedEvent.java
    │   # {sessionId, companyId, endedAt, viewerCount}
    ├── StreamJobAppliedEvent.java
    │   # {applicationId, sessionId, candidateId, jobPostId}
    └── InterviewSlotBookedEvent.java
        # {sessionId, slotId, candidateId, interviewTime}
```

---

## Subscription Plans cần bổ sung quota stream

```java
// Thêm vào SubscriptionPlan.java
private int streamSessionsPerMonth;     // VD: 0 / 2 / 10 / unlimited
private int maxViewersPerSession;       // VD: 50 / 200 / 1000
private boolean aiSummaryEnabled;       // false / true / true
private boolean replayEnabled;          // false / true / true
private int interviewSlotsPerSession;   // 0 / 5 / 20
```

---

## API Endpoints tóm tắt

### Employer
| Method | Path | Use Case |
|--------|------|----------|
| POST | `/api/streams` | Tạo phiên |
| PUT | `/api/streams/{id}` | Cập nhật |
| POST | `/api/streams/{id}/start` | Bắt đầu live |
| POST | `/api/streams/{id}/end` | Kết thúc |
| POST | `/api/streams/{id}/spotlight` | Ghim job |
| POST | `/api/streams/{id}/polls` | Tạo poll |
| POST | `/api/streams/{id}/invite-slot` | Mời interview |
| GET | `/api/streams/{id}/analytics` | Xem analytics |

### Candidate
| Method | Path | Use Case |
|--------|------|----------|
| GET | `/api/streams/upcoming` | Marketplace |
| POST | `/api/streams/{id}/join` | Tham gia |
| POST | `/api/streams/{id}/questions` | Đặt câu hỏi Q&A |
| POST | `/api/streams/{id}/polls/{pollId}/respond` | Trả lời poll |
| POST | `/api/streams/{id}/apply` | Apply từ stream |
| POST | `/api/streams/{id}/slots/{slotId}/accept` | Nhận interview |
| GET | `/api/streams/{id}/replay` | Xem lại |

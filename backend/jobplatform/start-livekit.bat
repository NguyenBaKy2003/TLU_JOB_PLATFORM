docker run --rm \
  -p 7880:7880 \
  -p 7881:7881/tcp \
  -p 50200-50300:50200-50300/udp \
  livekit/livekit-server --dev \
  --bind 0.0.0.0

   ngrok start --all --config ngrok.yml

   ngrok start --all --config D:/TLU_JOB_PLATFORM/backend/jobplatform/ngrok.yml
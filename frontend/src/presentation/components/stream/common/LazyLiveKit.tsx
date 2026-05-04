// presentation/components/stream/common/LazyLiveKit.tsx
"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { LoadingScreen } from "./LoadingScreen";

// Lazy load LiveKitWrapper
const LiveKitWrapperLazy = dynamic(
  () => import("./LiveKitWrapper").then(mod => mod.LiveKitWrapper),
  {
    ssr: false,
    loading: () => <LoadingScreen />
  }
);

type LiveKitWrapperProps = ComponentProps<typeof LiveKitWrapperLazy>;

interface LazyLiveKitProps extends LiveKitWrapperProps {
  enabled: boolean;
}

export function LazyLiveKit({ enabled, ...props }: LazyLiveKitProps) {
  if (!enabled || !props.token) {
    return props.children;
  }

  return <LiveKitWrapperLazy {...props} />;
}
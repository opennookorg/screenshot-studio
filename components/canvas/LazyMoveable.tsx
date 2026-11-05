"use client";

import dynamic from "next/dynamic";
import type { ComponentType, RefAttributes } from "react";
import type Moveable from "react-moveable";
import type { MoveableProps } from "react-moveable";

export const LazyMoveable = dynamic(() => import("react-moveable"), {
  ssr: false,
}) as unknown as ComponentType<MoveableProps & RefAttributes<Moveable>>;

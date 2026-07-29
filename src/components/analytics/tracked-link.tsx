"use client";

import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { trackEvent, type AnalyticsEvent, type AnalyticsProps } from "@/lib/analytics";

type Props = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    event: AnalyticsEvent;
    eventProps?: AnalyticsProps;
  };

/**
 * Drop-in replacement for next/link that also fires an analytics event on
 * click. Renders identically to `<Link>` — no visual or markup changes,
 * only an added onClick side effect.
 */
export function TrackedLink({ event, eventProps, onClick, ...linkProps }: Props) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    trackEvent(event, eventProps);
    onClick?.(e);
  }

  return <Link {...linkProps} onClick={handleClick} />;
}

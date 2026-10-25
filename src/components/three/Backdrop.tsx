import { Component, type ReactNode } from 'react';

/** Si le rendu WebGL échoue, on affiche le repli au lieu de casser la page. */
export class SafeCanvas extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}

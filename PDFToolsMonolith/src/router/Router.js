import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * A minimal client-side router that uses the History API.
 * Supports:
 *  - <Router> provider
 *  - <Route path> matching exact path
 *  - <Link to> navigation
 *  - <Navigate to> programmatic redirect
 *  - useNavigate hook
 */

// Context
const RouterContext = createContext({ path: '/', navigate: () => {} });

// PUBLIC_INTERFACE
export function Router({ children }) {
  /** Router provider tracking location and exposing navigate() */
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (to) => {
    if (to !== path) {
      window.history.pushState({}, '', to);
      setPath(to);
      window.scrollTo(0, 0);
    }
  };

  const value = useMemo(() => ({ path, navigate }), [path]);

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function Route({ path, element }) {
  /** Render element when current path matches. */
  const ctx = useContext(RouterContext);
  if (!ctx) return null;
  return ctx.path === path ? element : null;
}

// PUBLIC_INTERFACE
export function Routes({ children }) {
  /** Group of routes. Renders the first matching child. */
  const ctx = useContext(RouterContext);
  let match = null;
  React.Children.forEach(children, (child) => {
    if (match) return;
    if (!React.isValidElement(child)) return;
    const { path } = child.props;
    if (path === ctx.path) {
      match = child;
    }
  });
  return match;
}

// PUBLIC_INTERFACE
export function Link({ to, children, ...rest }) {
  /** Link for navigation */
  const ctx = useContext(RouterContext);
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault();
        ctx.navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

// PUBLIC_INTERFACE
export function Navigate({ to }) {
  /** Immediate redirect to target path. */
  const ctx = useContext(RouterContext);
  useEffect(() => {
    ctx.navigate(to);
  }, [to]);
  return null;
}

// PUBLIC_INTERFACE
export function useNavigate() {
  /** Hook to get navigate function. */
  const ctx = useContext(RouterContext);
  return ctx.navigate;
}

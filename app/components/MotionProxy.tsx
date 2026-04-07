"use client";

import { m, MotionProps } from "framer-motion";
import React, { useEffect, useState, useMemo } from "react";

// Hook to detect mobile
// Optimization: Use a single listener for all motion components
let globalIsMobile = false;
const listeners = new Set<(isMobile: boolean) => void>();

if (typeof window !== 'undefined') {
    const mql = window.matchMedia('(max-width: 767px)');
    globalIsMobile = mql.matches;
    mql.addEventListener('change', (e) => {
        globalIsMobile = e.matches;
        listeners.forEach(l => l(globalIsMobile));
    });
}

export const useIsMobile = () => {
    // Start with false to match Server Side Rendering (SSR) initial state
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        // Hydrate with the actual client value after first mount
        setIsMobile(globalIsMobile);
        
        const handler = (val: boolean) => setIsMobile(val);
        listeners.add(handler);
        return () => {
            listeners.delete(handler);
        };
    }, []);
    
    return isMobile;
};

// List of motion-specific props to filter out for native elements
const motionProps = new Set([
    "initial",
    "animate",
    "exit",
    "transition",
    "variants",
    "whileHover",
    "whileTap",
    "whileFocus",
    "whileDrag",
    "whileInView",
    "layout",
    "layoutId",
    "onLayoutAnimationStart",
    "onLayoutAnimationComplete",
    "onViewportBoxUpdate",
    "onUpdate",
    "onDrag",
    "onDragStart",
    "onDragEnd",
    "onMeasureDragConstraints",
    "drag",
    "dragControls",
    "dragListener",
    "dragConstraints",
    "dragElastic",
    "dragMomentum",
    "dragPropagation",
    "dragTransition",
    "onPan",
    "onPanStart",
    "onPanEnd",
    "onPanSessionStart",
    "onTap",
    "onTapStart",
    "onTapCancel",
    "onHoverStart",
    "onHoverEnd",
    "viewport",
]);

// Helper to filter props
const filterProps = (props: any) => {
    const newProps: any = {};
    for (const key in props) {
        if (!motionProps.has(key)) {
            newProps[key] = props[key];
        }
    }
    return newProps;
};

// Component cache to ensure stable references
const componentCache: Record<string, React.ForwardRefExoticComponent<any>> = {};

const Motion = new Proxy(m, {
    get: (target: any, prop: string) => {
        if (typeof prop !== 'string') return target[prop];

        if (componentCache[prop]) {
            return componentCache[prop];
        }

        const Component = React.forwardRef((props: any, ref: any) => {
            const isMobile = useIsMobile();

            if (isMobile) {
                const Tag = prop as any;
                const nativeProps = filterProps(props);
                return <Tag {...nativeProps} ref={ref} />;
            }

            const MotionComponent = target[prop];
            if (!MotionComponent) {
                return React.createElement(prop, props, props.children);
            }
            return <MotionComponent {...props} ref={ref} />;
        });

        Component.displayName = `MotionProxy.${prop}`;
        componentCache[prop] = Component;
        return Component;
    }
});

export { Motion };
export type { MotionProps };

import React, {
    memo,
    useEffect,
    useRef,
} from 'react';
import PropTypes from 'prop-types';

const InViewLoader = ({
    checkOnChange,
    children,
    onInView: onInViewProp,
    rootMargin,
    rootRef,
    ...rest
}) => {
    const ref = useRef();
    const intersecting = useRef(false);
    // safety precaution for onInViewProp that changes on every render
    const onInView = useRef(onInViewProp);

    useEffect(() => {
        const node = ref.current;

        if (!node) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const { isIntersecting } = entries.pop();
                intersecting.current = isIntersecting;

                if (isIntersecting) {
                    onInView.current();
                }
            },
            {
                root: rootRef?.current || node?.parentNode,
                rootMargin,
            }
        );

        observer.observe(node);

        return () => {
            intersecting.current = false;
            observer.disconnect();
        };
    }, [ref, rootRef, rootMargin]);

    // check if still in view after some prop update
    useEffect(() => {
        if (intersecting.current) {
            // wait for IntersectionObserver to report
            const timeout = setTimeout(() => {
                if (intersecting.current) {
                    onInView.current();
                }
            }, 100);

            return () => {
                clearTimeout(timeout);
            };
        }
        return undefined;
    }, [checkOnChange]);

    return (
        <div ref={ref} {...rest}>
            {children}
        </div>
    );
};

InViewLoader.propTypes = {
    checkOnChange: PropTypes.any,
    children: PropTypes.node,
    onInView: PropTypes.func.isRequired,
    rootMargin: PropTypes.string,
    rootRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};

export default memo(InViewLoader);

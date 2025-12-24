import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
        // Also reset interior containers since they have overflow: auto
        const containers = document.querySelectorAll('.admin-main, .user-main');
        containers.forEach(container => {
            container.scrollTo({ top: 0, behavior: 'instant' });
        });
    }, [pathname]);

    return null;
}

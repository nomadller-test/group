document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: document.querySelector('.presentation-container'),
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Reset animation by removing and re-adding class
                const content = entry.target.querySelector('.content-overlay');
                if (content) {
                    content.style.animation = 'none';
                    content.offsetHeight; /* trigger reflow */
                    content.style.animation = 'fadeInUp 1s ease forwards';
                }

                // Slide 2 Animation Trigger
                if (entry.target.id === 'slide2') {
                    startRouteAnimation();
                }

                // Specific hook for loading bar on last slide
                if (entry.target.id === 'slide8') {
                    const bar = entry.target.querySelector('.loading-bar::after');
                    // CSS animation handles it via keyframes
                }
            } else {
                // Optional: Reset slide 2 animation when leaving
                if (entry.target.id === 'slide2') {
                    resetRouteAnimation();
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.slide').forEach(slide => {
        observer.observe(slide);
    });
});

let animationTimeouts = [];

function startRouteAnimation() {
    // Clear any existing timeouts to prevent overlapping animations
    resetRouteAnimation();

    const trainIcon = document.getElementById('train-icon');
    const busIcon = document.getElementById('bus-icon');
    const vehicleGroup = document.getElementById('vehicle-group');
    
    // Paths
    const legs = [
        { id: 'path-leg1', vehicle: 'train', duration: 2000 },
        { id: 'path-leg2', vehicle: 'bus', duration: 2000 },
        { id: 'path-leg3', vehicle: 'bus', duration: 2000 },
        { id: 'path-leg4', vehicle: 'train', duration: 2000 },
        { id: 'path-leg5', vehicle: 'train', duration: 2000 }
    ];

    let currentDelay = 0;

    legs.forEach((leg, index) => {
        const timeout = setTimeout(() => {
            animateLeg(leg);
        }, currentDelay);
        animationTimeouts.push(timeout);
        currentDelay += leg.duration; // Sequential timing
    });
}

function resetRouteAnimation() {
    animationTimeouts.forEach(t => clearTimeout(t));
    animationTimeouts = [];
    
    // Hide vehicles
    document.getElementById('train-icon').style.display = 'none';
    document.getElementById('bus-icon').style.display = 'none';
    
    // Reset paths
    document.querySelectorAll('.hidden-path').forEach(path => {
        path.style.strokeDasharray = path.getTotalLength();
        path.style.strokeDashoffset = path.getTotalLength();
        path.style.stroke = 'rgba(255, 255, 255, 0.2)'; // Faded state
    });
}

function animateLeg(leg) {
    const path = document.getElementById(leg.id);
    const trainIcon = document.getElementById('train-icon');
    const busIcon = document.getElementById('bus-icon');
    const vehicleGroup = document.getElementById('vehicle-group');

    // Set Vehicle Visibility
    if (leg.vehicle === 'train') {
        trainIcon.style.display = 'block';
        busIcon.style.display = 'none';
    } else {
        trainIcon.style.display = 'none';
        busIcon.style.display = 'block';
    }

    // Prepare Path Animation
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    path.style.display = 'block';
    
    // Trigger Path Drawing (CSS transition)
    path.getBoundingClientRect(); // Reflow
    path.style.transition = `stroke-dashoffset ${leg.duration}ms linear`;
    path.style.strokeDashoffset = '0';
    path.style.stroke = '#00d2ff'; // Highlight color

    // Animate Vehicle along path
    const startTime = performance.now();
    
    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / leg.duration, 1);
        
        // Get point at current progress
        const point = path.getPointAtLength(length * progress);
        
        // Move vehicle group
        vehicleGroup.setAttribute('transform', `translate(${point.x}, ${point.y})`);

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    
    requestAnimationFrame(step);
}

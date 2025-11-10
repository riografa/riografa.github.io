import { gsap } from "gsap";
    
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger,ScrollSmoother);

gsap.from('#navbar'), {
    y: -100,
    duration: 1,
    ease: "bounce.out" , 
};


export class Observer {

    #dom;
    #elem;
    #directionY = true;
    #directionX = true;
    #scroller;
    #threshold;
    #domElTraverse = {};

    #intersect = {
        on: function() {

        },
        off: function() {

        }
    };

    constructor(domTravserEngine, elem, threshold) {
        if(typeof domTravserEngine !== "function") {
            throw new Error('You need to add a dom traversal engine for it to work. Like Stratox DOM or jQuery.');
        }
        this.#dom = domTravserEngine;
        this.#elem = this.#dom(elem);
        this.#threshold = (typeof threshold === "number") ? threshold : 0.8;
        this.#scrollEvent();
    }

    scroll(fn) {
        if(typeof fn !== "function") {
            throw new Error('The scroll event expects the argumnet 1 to be function!');
        }
        this.#scroller = fn;
    }

    observe(on, off) {
        const inst = this;
        if('IntersectionObserver' in window) {
            if(typeof on === "function") inst.#intersect.on = on;

            if(typeof off === "function") inst.#intersect.off = off;
            this.#elem.each(function() {
                let elem = inst.#dom(this), height = elem.height(), th = inst.#threshold, el = elem.get(0);
                if(height > (window.innerHeight * inst.#threshold)) th = ((window.innerHeight * inst.#threshold) / height) * inst.#threshold;
                el.data = { direction: ((elem.data("direction") === "horizontal") ? "horizontal" : "vertical") };
                const observer = new IntersectionObserver(inst.#observeFeed, { threshold: th });
                observer.inst = inst;
                observer.observe(el); 
            });

        } else {
            console.warn("Your browser do not support IntersectionObserver. Can not observe scroll postion.");
        }
    }

    #scrollEvent() {
        let inst = this, prevScroll = 0, prevScrollX = 0;
        inst.#dom(window).scroll(function(e) {
            let scrollTop = window.scrollY, scrollLeft = window.scrollX;
            inst.#directionY = !(scrollTop < prevScroll);
            inst.#directionX = !(scrollLeft < prevScrollX);

            if(typeof inst.#scroller === "function") {
                inst.#scroller(e, {
                    elem: window,
                    scrollTop: scrollTop,
                    scrollLeft: scrollLeft,
                    prevScrollY: prevScroll,
                    prevScrollX: prevScrollX
                });
            }

            prevScroll = scrollTop;
            prevScrollX = scrollLeft;
        });

    }

    #observeFeed(entries, observer) {

        const inst = observer.inst;
        inst.#dom.each(entries, function(k, entry) {
            const elemKey = entry?.target?.dataset?.selectElem;
            if(entry.isIntersecting) {
                if(!inst.#domElTraverse[elemKey]) inst.#domElTraverse[elemKey] = inst.#dom("#"+elemKey);
                if(inst.#domElTraverse[elemKey]) inst.#domElTraverse[elemKey].addClass("active");
                entry.target.classList.add("observer-active");
                inst.#intersect.on(entry);
            } else {
                if((entry.target.data.direction === "vertical" && !inst.#directionY) || 
                    (entry.target.data.direction === "horizontal" && inst.#directionX)) {
                    entry.target.classList.remove("observer-active");
                    inst.#intersect.off(entry);
                }
                if(inst.#domElTraverse[elemKey]) inst.#domElTraverse[elemKey].removeClass("active");
            }
        });

    }

}
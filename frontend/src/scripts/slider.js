const items = document.querySelectorAll('.item')
const controls = document.querySelectorAll('.control')
const headerItems = document.querySelectorAll('.item-header')
const descriptionItems = document.querySelectorAll('.item-description')
const activeDelay = .76
const interval = 5000

let current = 0

const slider = {
    init: function () {
        for (let i = 0; i < controls.length; i++) {
            controls[i].addEventListener('click', function (e) {
                slider.clickedControl(e)
            })
        }
        controls[current].classList.add('active');
        items[current].classList.add('active');
    },
    nextSlide: function () { // Increment current slide and add active class
        slider.reset();
        if (current === items.length - 1) {
            current = -1; // Check if current slide is last in array  
        }
        current++;
        controls[current].classList.add('active');
        items[current].classList.add('active');
        slider.transitionDelay(headerItems);
        slider.transitionDelay(descriptionItems);
    },
    clickedControl: function (e) { // Add active class to clicked control and corresponding slide
        slider.reset();
        clearInterval(intervalF);

        const control = e.target,
            dataIndex = Number(control.dataset.index);

        control.classList.add('active');
        for (let i = 0; i < items.length; i++) {
            if (i === dataIndex) { // Add active class to corresponding slide
                items[i].classList.add('active');
            }
        }
        current = dataIndex; // Update current slide
        slider.transitionDelay(headerItems);
        slider.transitionDelay(descriptionItems);
        intervalF = setInterval(slider.nextSlide, interval); // Fire that bad boi back up
    },
    reset: function () { // Remove active classes
        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove('active');
        }
        for (let i = 0; i < controls.length; i++) {
            controls[i].classList.remove('active');
        }
    },
    transitionDelay: function (items) { // Set incrementing css transition-delay for .item-header & .item-description, .vertical-part, b elements
        let seconds;
        for (let i = 0; i < items.length; i++) {
            const children = items[i].childNodes; // .vertical-part(s)
            let count = 1
            let delay;

            items[i].classList.value === 'item-header' ? seconds = .015 : seconds = .007;
            for (let j = 0; j < children.length; j++) {
                if (children[j].classList) {
                    items[i].parentNode.classList.contains('active') ? delay = count * seconds + activeDelay : delay = count * seconds;
                    children[j].firstElementChild.style.transitionDelay = delay + 's'; // b element
                    count++;
                }
            }
        }
    }
}

let intervalF = setInterval(slider.nextSlide, interval);
slider.init();

import {
    Directive,
    Output,
    EventEmitter,
    HostBinding,
    HostListener
} from '@angular/core';


@Directive({
    selector: '[longPress2]'
})
export class LongPressDirective {
    pressing!: boolean;
    longPressing!: boolean;
    timeout!: number;
    interval!: number;

    @Output()
    onLongPress = new EventEmitter();

    @Output()
    onLongPressing = new EventEmitter();

    @HostBinding('class.press')
    get press() { return this.pressing; }

    @HostBinding('class.longpress')
    get longPress() { return this.longPressing; }

    @HostListener('touchstart', ['$event'])
    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        this.pressing = true;
        this.longPressing = false;
        this.timeout = window.setTimeout(() => {
            this.longPressing = true;
            this.onLongPress.emit(event);
            this.interval = window.setInterval(() => {
                this.onLongPressing.emit(event);
            }, 100);
        }, 500);
    }

    @HostListener('touchend')
    @HostListener('mouseup')
    @HostListener('mouseleave')
    endPress() {
        clearTimeout(this.timeout);
        clearInterval(this.interval);
        this.longPressing = false;
        this.pressing = false;
    }
}

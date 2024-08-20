"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var Draggable = /** @class */ (function () {
    function Draggable(element) {
        this.element = element;
        this.topStart = 0;
        this.leftStart = 0;
        this._allowDrag = true;
    }
    Draggable.prototype.ngOnInit = function () {
        // css changes
        if (this._allowDrag) {
            this.element.nativeElement.style.position = "relative";
            this.element.nativeElement.className += " cursor-draggable";
        }
    };
    Draggable.prototype.onMouseDown = function (event) {
        if (event.button === 2)
            return; // prevents right click drag, remove his if you don't want it
        this.md = true;
        this.topStart =
            event.clientY - this.element.nativeElement.style.top.replace("px", "");
        this.leftStart =
            event.clientX - this.element.nativeElement.style.left.replace("px", "");
    };
    Draggable.prototype.onMouseUp = function (event) {
        this.md = false;
    };
    Draggable.prototype.onMouseMove = function (event) {
        if (this.md && this._allowDrag) {
            this.element.nativeElement.style.top =
                event.clientY - this.topStart + "px";
            this.element.nativeElement.style.left =
                event.clientX - this.leftStart + "px";
        }
    };
    Draggable.prototype.onTouchStart = function (event) {
        this.md = true;
        this.topStart =
            event.changedTouches[0].clientY -
                this.element.nativeElement.style.top.replace("px", "");
        this.leftStart =
            event.changedTouches[0].clientX -
                this.element.nativeElement.style.left.replace("px", "");
        event.stopPropagation();
    };
    Draggable.prototype.onTouchEnd = function () {
        this.md = false;
    };
    Draggable.prototype.onTouchMove = function (event) {
        if (this.md && this._allowDrag) {
            this.element.nativeElement.style.top =
                event.changedTouches[0].clientY - this.topStart + "px";
            this.element.nativeElement.style.left =
                event.changedTouches[0].clientX - this.leftStart + "px";
        }
        event.stopPropagation();
    };
    Object.defineProperty(Draggable.prototype, "allowDrag", {
        set: function (value) {
            this._allowDrag = value;
            if (this._allowDrag)
                this.element.nativeElement.className += " cursor-draggable";
            else
                this.element.nativeElement.className = this.element.nativeElement.className.replace(" cursor-draggable", "");
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        core_1.HostListener("mousedown", ["$event"])
    ], Draggable.prototype, "onMouseDown");
    __decorate([
        core_1.HostListener("document:mouseup")
    ], Draggable.prototype, "onMouseUp");
    __decorate([
        core_1.HostListener("document:mousemove", ["$event"])
    ], Draggable.prototype, "onMouseMove");
    __decorate([
        core_1.HostListener("touchstart", ["$event"])
    ], Draggable.prototype, "onTouchStart");
    __decorate([
        core_1.HostListener("document:touchend")
    ], Draggable.prototype, "onTouchEnd");
    __decorate([
        core_1.HostListener("document:touchmove", ["$event"])
    ], Draggable.prototype, "onTouchMove");
    __decorate([
        core_1.Input("element-draggable")
    ], Draggable.prototype, "allowDrag");
    Draggable = __decorate([
        core_1.Directive({
            selector: "[element-draggable]"
        })
    ], Draggable);
    return Draggable;
}());
exports.Draggable = Draggable;

//# sourceMappingURL=draggable.directive.js.map

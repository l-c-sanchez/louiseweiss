
/**
 * This is a class to listen to MouseWheel events.
 * We can only register a single event.
 */

export class MouseWheel {
    private Elem     : HTMLElement;
    private Callback : any; // Function

    constructor(){
        // TODO: find a better element / or better way to reference that
        this.Elem = document.getElementById("phaser-app");        
    }

    public addEvent(callback: Function, context: any){
        this.removeEvents();
        this.Callback = callback.bind(context);
        this.Elem.addEventListener("wheel", this.Callback);
    }

    public removeEvents(){
        if (this.Callback){
            this.Elem.removeEventListener("wheel", this.Callback);
        }
    }

}
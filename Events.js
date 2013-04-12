document.onmousedown = function(evt)
{
    evt = evt || event;
    engine.mouseDown(evt);
}

document.onmouseup = function(evt)
{
    evt = evt || event;
    engine.mouseUp(evt);
}

document.addEventListener('keydown', function(event) {
     switch(event.keyCode) {
        case 80:
            if(engine.running == true) {
                engine.running = false;
            } else {
                engine.running = true;
                Run();
            }
            break;
        case 82:
            engine.reset();
            break;
        case 83:
            engine.toggleSound();
            break;
    } 
});

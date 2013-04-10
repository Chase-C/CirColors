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

// Initialize the Thunder.js library
Th.init();

var Sound =
{
    sineFunc: function(si, len, frq, chn, opt)
    {
        var fad = Math.min(1, (opt.sustain || 1) * (len - si) / len);
        return Math.floor(fad * 128 * 256 * (
                    Math.sin(2.0 * Math.PI * frq * si / 44100)));
    }
};

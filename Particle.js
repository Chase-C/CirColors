var Particle = function(x, y)
{
    // Position
    this.x = x || 0;
    this.y = y || 0;
    // Radius
    this.r = 8;

    // Mass
    this.m = 10000000;

    // Velocity
    this.vx = 1;
    this.vy = 0;

    // Color
    this.color = (new Color(0, 0, 0)).Red();
    this.tempColor = null;
    this.percent = 0;

    // Does it get updated?
    this.activate = false;
}

Particle.prototype =
{
    // Getter and setter methods
    getX: function() { return this.x },
    setX: function(x) { this.x = x },
    
    getY: function() { return this.y },
    setY: function(y) { this.y = y },

    getRadius: function() { return this.r },

    getVelX: function() { return this.vx },
    setVelX: function(vx) { this.vx = vx },

    getVelY: function() { return this.vy },
    setVelY: function(vy) { this.vy = vy },

    // Vector getter and setter methods
    velocityVector: function()
    {
        return new Vector(this.vx, this.vy);
    },

    setVel: function(vector)
    {
        this.setVelX(vector.getX());
        this.setVelY(vector.getY());
    },

    // Called every frame to update the particle's position
    update: function()
    {
        if(this.activate) {
            this.x += this.vx;
            this.y += this.vy;
            if(this.percent < 100)
                this.percent += 1;
        }
    },

    release: function(vel)
    {
        this.setVel(vel);
        this.m = this.r * this.r * Math.PI;
        this.percent = 100;

        this.activate = true;
    },

    // Slightly increase the radius of the particle
    increaseRadius: function()
    {
        if(this.r < 50) {
            this.r += 0.25;

            if(this.percent <= 150) {
                this.color = this.color.Red().mix(
                        this.color.Yellow(), (100 / 150) * this.percent);
            } else if(this.percent <= 220) {
                this.color = this.color.Yellow().mix(
                        this.color.Green(), (100 / 70) * (this.percent - 150));
            } else if(this.percent <= 290) {
                this.color = this.color.Green().mix(
                        this.color.Cyan(), (100 / 70) * (this.percent - 220));
            } else if(this.percent <= 400) {
                this.color = this.color.Cyan().mix(
                        this.color.Blue(), (100 / 110) * (this.percent - 290));
            }

            var stepSize = (50 - 8) * 4; // or / .25;
            this.percent += 400 / stepSize;
        }
    },

    getMass: function()
    {
        return this.m;
    },

    // Start the particle effect
    switchColor: function(color)
    {
        this.tempColor = color;
        this.percent = 20;
    },

    // Draw the particle
    draw: function(canvas)
    {
        var radius = this.r;

        if(this.activate && this.percent < 100) {
            canvas.fillStyle = this.tempColor.toString();
            canvas.beginPath();
            canvas.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
            canvas.closePath();
            canvas.fill();

            radius = radius * (this.percent / 100);
        }

        canvas.fillStyle = this.color.toString();
        canvas.beginPath();
        canvas.arc(this.x, this.y, radius, 0, Math.PI * 2, true);
        canvas.closePath();
        canvas.fill();
    }
}

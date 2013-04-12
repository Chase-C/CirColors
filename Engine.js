var Engine = function(w, h)
{
    this.w = w || 0;
    this.h = h || 0;

    this.particles = [];


    this.points1 = [];
    this.points2 = [];
    this.leftColor = new Color(255, 255, 255);
    this.rightColor = new Color(255, 255, 255);
    this.alpha = 0;

    this.running = true;
    this.sound = true;

    this.lmouseButton = false;
    this.rmouseButton = false;
}

Engine.prototype =
{
    // Update the simulation each frame
    update: function()
    {
        if(this.lmouseButton) {
            var particle = this.particles.pop();
            particle.increaseRadius();
            this.particles.push(particle);
        }
        for(i = 0; i < this.particles.length; i++) {
            // Update each particle
            this.particles[i].update();
            // Check for particles moving off the edge of the screen
            this.checkEdgeCollision(this.particles[i]);
            for(j = 0; j < this.particles.length; j++) {
                // Check collisions between each particle
                if(this.checkCollision(this.particles[i], this.particles[j])) {
                    this.resolveCollision(this.particles[i], this.particles[j]);
                }
            }
        }

        // Decrease the alpha value
        if(this.alpha > 0) {
            this.alpha *= 0.8;
            if(this.alpha < 0.01)
                this.alpha = 0;
        }
    },

    // Reset the simulation
    reset: function()
    {
        this.particles = [];
        if(this.running == false) {
            this.running = true;
            Run();
        }
    },

    // Add a particle to the array
    addParticle: function(x, y)
    {
        var particle = new Particle(x, y);
        this.particles.push(particle);
    },

    // Check for particles moving off the edge of the screen
    checkEdgeCollision: function(particle)
    {
        // Check the X value
        if(particle.getX() - particle.getRadius() > this.w) {
            particle.setX(0 - particle.getRadius());
        } else if(particle.getX() + particle.getRadius() < 0) {
            particle.setX(this.w + particle.getRadius());
        }
        // Check the Y value
        if(particle.getY() - particle.getRadius() > this.h) {
            particle.setY(0 - particle.getRadius());
        } else if(particle.getY() + particle.getRadius() < 0) {
            particle.setY(this.h + particle.getRadius());
        }
    },

    // Check for a collision between two particles
    // Returns bool
    checkCollision: function(p1, p2)
    {
        if(p1 == p2)
            return;

        var xDist = p1.x - p2.x;
        var yDist = p1.y - p2.y;

        var totalRadius = p1.r + p2.r;
        
        // Circle on circle distance check
        if((xDist * xDist) + (yDist * yDist) <= totalRadius * totalRadius) {
            return true;
        }

        return false;
    },

    // Give colliding particles the correct velocity
    resolveCollision: function(p1, p2)
    {
        // Unit normal and tangent vectors (length 1)
        var unitNormal = this.getParticleVectorNormal(p1, p2).normalize();
        var unitTangent = new Vector(-unitNormal.getY(), unitNormal.getX());
        // Check if the particles are already moving away from each other
        var velVec = p1.velocityVector().subtract(p2.velocityVector());
        if(velVec.dot(unitNormal) > 0)
            return;
        // Scalar normal and tangental velocities
        var velNorm1 = unitNormal.copy().dot(p1.velocityVector());
        var velTan1 = unitTangent.copy().dot(p1.velocityVector());

        var velNorm2 = unitNormal.copy().dot(p2.velocityVector());
        var velTan2 = unitTangent.copy().dot(p2.velocityVector());
        // Sum and difference of particle masses
        var massDiff = p1.getMass() - p2.getMass();
        var massSum = p1.getMass() + p2.getMass();
        // New normal scalar velocities
        var newNormVel1 = ((velNorm1*massDiff) + (2*p2.getMass()*velNorm2)) / massSum;
        var newNormVel2 = ((velNorm2*-massDiff) + (2*p1.getMass()*velNorm1)) / massSum;
        // Set new vector velocities
        p1.setVel(unitNormal.copy().scale(newNormVel1).add(
                    unitTangent.copy().scale(velTan1)));
        p2.setVel(unitNormal.scale(newNormVel2).add(
                    unitTangent.copy().scale(velTan2)));

        // Play a sound
        if(this.sound == true) {
            var frq = (750000 / massSum) + 60;
            frq = frq.toString();
            Sound.instSound(frq);
        }

        // Initiate particle effect
        p1.switchColor(p2.color);
        p2.switchColor(p1.color);

        // Initiate the background effect
        this.splitColor(p1, p2, unitTangent);
    },

    // Gets the normal vector between two particles
    getParticleVectorNormal: function(p1, p2)
    {
        return new Vector(p1.getX() - p2.getX(), p1.getY() - p2.getY());
    },

    // These functions are called when the mouse buttons are used
    mouseDown: function(evt) 
    {
        if(evt.button == 0) {
            this.lmouseButton = true;
            // If the left mouse button was pressed
            if(this.particles.length > 0) {
                // Get the last particle in the list
                var particle = this.particles.pop();
                // Release the particle
                particle.release(particle.velocityVector());
                this.particles.push(particle);
            }
            engine.addParticle(evt.pageX, evt.pageY);
        } else if(evt.button == 1) {
            this.rmouseButton = true;
        }
    },

    mouseUp: function(evt)
    {
        if(evt.button == 0) {
            this.lmouseButton = false;

            // The x and y mouse coordinates
            var mouseX = evt.pageX;
            var mouseY = evt.pageY;
            if(this.particles.length > 0) {
                var particle = this.particles.pop();
                // Set the velocity depending on the direction of the mouse
                var vec = new Vector(mouseX - particle.getX(), mouseY - particle.getY());
                vec.scale(0.015);
                if(vec.getLength() > 6) {
                    vec.normalize();
                    vec.scale(6);
                }
                particle.release(vec);
                this.particles.push(particle);
            }
        } else if(evt.button == 1) {
            this.rmouseButton = false;
        }
    },

    // Toggle the sound
    toggleSound: function()
    {
        this.sound = !this.sound;
    },

    // Split the screen along the tangent between two colliding particles
    // The colors of two parts of the screen depend on the colors of the particles
    splitColor: function(p1, p2, tangent)
    {
        // Get the x and y position of the collision
        var offsetVec = new Vector(p1.getX() - p2.getX(), p1.getY() - p2.getY());
        offsetVec = offsetVec.normalize();
        offsetVec = offsetVec.scale(p1.getRadius());
        var x = p1.getX() - offsetVec.getX();
        var y = p1.getY() - offsetVec.getY();

        // Get the slope and y-intercept of the tangent line of the collision
        var m = tangent.getY() / tangent.getX();
        var b = y - (m * x);

        var point1 = new Object();
        var point2 = new Object();

        // Function for checking if the line intersects the top or sides of the
        // screen
        function checkBounds(point)
        {
            if(point.x > this.w) {
                point.x = this.w;
                point.y = (m * px1) + b;
            } else if(point.y < 0) {
                point.x = 0;
                point.y = b;
            }
        }

        // Get the points where the line intersects the screen
        point1.x = -b / m;
        point1.y = 0;
        checkBounds(point1);

        point2.x = (this.h - b) / m;
        point2.y = this.h;
        checkBounds(point2);

        // Push the points to the points1[] and points2[] variables
        this.pushPoints(point1, point2);
        // Set the correct colors
        this.leftColor = (p1.getX() > p2.getX() ? p2.getColor() : p1.getColor());
        this.rightColor = (p1.getX() > p2.getX() ? p1.getColor() : p2.getColor());
        // Set the alpha value
        this.alpha = 0.65;
    },

    // Figure out which points go where
    pushPoints: function(p1, p2)
    {
        this.points1 = [];
        this.points2 = [];

        this.points1.push(p1);
        this.points1.push(p2);
        this.points2.push(p1);
        this.points2.push(p2);

        // Branching is fun!
        if(p1.y == 0) {
            if(p2.y == this.h) {
                this.points1.push({x: this.w, y: this.h});
                this.points1.push({x: this.w, y: 0});
                this.points2.push({x: 0, y: this.h});
                this.points2.push({x: 0, y: 0});
            } else if(p2.x == 0) {
                this.points1.push({x: 0, y: this.h});
                this.points1.push({x: this.w, y: this.h});
                this.points1.push({x: this.w, y: 0});
                this.points2.push({x: 0, y: 0});
            } else {
                this.points1.push({x: this.w, y: 0});
                this.points2.push({x: this.w, y: this.h});
                this.points2.push({x: 0, y: this.h});
                this.points2.push({x: 0, y: 0});
            }
        } else if(p1.x == 0) {
            if(p2.y == this.h) {
                this.points1.push({x: this.w, y: this.h});
                this.points1.push({x: this.w, y: 0});
                this.points1.push({x: 0, y: 0});
                this.points2.push({x: 0, y: this.h});
            } else {
                this.points1.push({x: this.w, y: 0});
                this.points1.push({x: 0, y: 0});
                this.points2.push({x: this.w, y: this.h});
                this.points2.push({x: 0, y: this.h});
            }
        } else {
            if(p2.y == this.h) {
                this.points1.push({x: this.w, y: this.h});
                this.points2.push({x: 0, y: this.h});
                this.points2.push({x: 0, y: 0});
                this.points2.push({x: this.w, y: 0});
            } else {
                this.points1.push({x: 0, y: this.h});
                this.points1.push({x: this.w, y: this.h});
                this.points2.push({x: 0, y: 0});
                this.points2.push({x: this.w, y: 0});
            }
        }
    },
    
    // Functions for starting and stopping the simulation
    start: function() { this.running = true },
    pause: function() { this.running = false },
    // Returns running
    isRunning: function() { return this.running },

    draw: function(canvas)
    {
        canvas.clearRect(0, 0, this.w, this.h);

        // Draw the left and right colored background portions of the screen
        if(this.alpha > 0)  {
            // Set the alpha
            canvas.globalAlpha = this.alpha;

            // Draw the right side of the screen
            canvas.fillStyle = this.rightColor.toString();

            canvas.beginPath();
            canvas.moveTo(this.points2[0].x, this.points2[0].y);
            for(var i = 1; i < this.points2.length; i++)
                canvas.lineTo(this.points2[i].x, this.points2[i].y);
            canvas.lineTo(this.points2[0].x, this.points2[0].y);
            canvas.closePath();

            canvas.fill();

            // Draw the left side of the screen
            canvas.fillStyle = this.leftColor.toString();

            canvas.beginPath();
            canvas.moveTo(this.points1[0].x, this.points1[0].y);
            for(var i = 1; i < this.points1.length; i++)
                canvas.lineTo(this.points1[i].x, this.points1[i].y);
            canvas.lineTo(this.points1[0].x, this.points1[0].y);
            canvas.closePath();

            canvas.fill();

            // Restore the alpha to 1
            canvas.globalAlpha = 1;
        }

        for(var i in this.particles) {
            this.particles[i].draw(canvas);
        }
    }
}

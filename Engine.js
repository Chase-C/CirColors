var Engine = function(w, h)
{
    this.w = w || 0;
    this.h = h || 0;

    this.particles = [];

    this.running = true;

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
    },

    reset: function()
    {
        this.particles = [];
        this.running = true;
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
        p2.setVel(unitNormal.scale(newNormVel2).add(unitTangent.scale(velTan2)));

        // Play a sound
        Sound.instSound((750000 / massSum) + 100);
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
                var particle = this.particles.pop();
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

            var mouseX = evt.pageX;
            var mouseY = evt.pageY;
            if(this.particles.length > 0) {
                var particle = this.particles.pop();
                var vec = new Vector(mouseX - particle.getX(), mouseY - particle.getY());
                vec.scale(0.025);
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

    // Functions for starting and stopping the simulation
    start: function() { this.running = true },
    pause: function() { this.running = false },
    // Returns running
    isRunning: function() { return this.running },

    draw: function(canvas)
    {
        canvas.clearRect(0, 0, this.w, this.h);
        for(var i in this.particles) {
            this.particles[i].draw(canvas);
        }
    }
}

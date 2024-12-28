const db = require('./db');

const logWorkout = (req, res) => {
    const { type, duration, date, user_id, exercises } = req.body;

    if (!type || !duration || !date || !user_id || !Array.isArray(exercises)) {
        res.status(400).json({ error: 'All fields are required, including a list of exercises' });
        return;
    }

    db.run(
        'INSERT INTO workouts (type, duration, date, user_id) VALUES (?, ?, ?, ?)',
        [type, duration, date, user_id],
        function (err) {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }

            const workoutId = this.lastID;

            // Insert exercises
            const insertExercise = db.prepare(
                'INSERT INTO exercises (name, reps, rpe, weight, sets, workout_id) VALUES (?, ?, ?, ?, ?, ?)'
            );

            exercises.forEach((exercise) => {
                insertExercise.run(
                    [exercise.name, exercise.reps, exercise.rpe, exercise.weight, exercise.sets, workoutId],
                    (err) => {
                        if (err) {
                            console.error('Error inserting exercise:', err.message);
                        }
                    }
                );
            });

            insertExercise.finalize(() => {
                res.status(201).json({ message: 'Workout logged successfully', workoutId });
            });
        }
    );
};

const getAllWorkouts = (req, res) => {
    const user_id = req.user.id;

    if (!user_id) {
        res.status(400).json({error: "You need to login first"});
        return;
    }

    db.all(
        'SELECT * FROM workouts WHERE user_id = ?', 
        [user_id], 
        (err, workouts) => {
            if (err) {
                res.status(400).json({error: "Database error"});
                return;
            }
        }
    );
}


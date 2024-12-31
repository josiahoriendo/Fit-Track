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
        req.status(400).json({error: 'Need to be signed in to acess workout history'});
        return;
    }

    db.all('SELECT * FROM workouts WHERE user_id = ?', [user_id], (err, workouts) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }

        // Fetch exercises for each workout
        const workoutIds = workouts.map((workout) => workout.id);
        const placeholders = workoutIds.map(() => '?').join(',');

        db.all(
            `SELECT * FROM exercises WHERE workout_id IN (${placeholders})`,
            workoutIds,
            (err, exercises) => {
                if (err) {
                    res.status(500).json({ error: 'Database error' });
                    return;
                }

                // Combine workouts with their exercises
                const result = workouts.map((workout) => ({
                    ...workout,
                    exercises: exercises.filter((exercise) => exercise.workout_id === workout.id),
                }));

                res.json(result);
            }
        );
    });
};

const getWorkout = (req, res) => {
    const user_id = req.user.id;

    if (!user_id) {
        req.status(400).json({error: 'Need to be signed in to acess workout history'});
        return;
    }

    const {workout_id} = req.body;

    if (!workout_id) {
        req.status(400).json({error: 'Need to provide a workout ID'});
        return;
    }

    db.get(
        'SELECT * FROM workouts WHERE id = ? AND user_id = ?',
        [workout_id, user_id], 
        (err, workout) => {
            if (err) {
                res.status(500).json({error: 'Database Error'});
                return;
            }

            if (!workout) {
                res.status(400).json({error: 'No workout with this ID found'});
                return;
            }

            db.all(
                'SELECT * FROM exercises WHERE workout_id = ?', 
                [workout_id], 
                (err, exercises) => {
                    if (err) {
                        res.status(500).json({error: 'Database error'})
                        return;
                    }

                    const result = {
                        ...workout,
                        exercises,
                    };

                    res.status(200).json(result);
                }
            );
        }
    );
}

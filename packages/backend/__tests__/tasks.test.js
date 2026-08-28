const request = require('supertest');
const { app, db } = require('../src/app');

afterAll(() => {
  if (db) db.close();
});

describe('Tasks API', () => {
  let taskId;

  it('should create a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test Task', description: 'A test task', due_date: '2025-09-30' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Test Task');
    expect(res.body.description).toBe('A test task');
    expect(res.body.due_date).toBe('2025-09-30');
    expect(res.body.completed).toBe(0);
    taskId = res.body.id;
  });

  it('should default priority to P3 when not provided', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'No priority task' });
    expect(res.status).toBe(201);
    expect(res.body.priority).toBe('P3');
  });

  it('should create a task with an explicit valid priority', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'High priority task', priority: 'P1' });
    expect(res.status).toBe(201);
    expect(res.body.priority).toBe('P1');
  });

  it('should reject creating a task with an invalid priority', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Bad priority task', priority: 'P4' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Priority must be one of/);
  });

  it('should get all tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a single task by id', async () => {
    const res = await request(app).get(`/api/tasks/${taskId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(taskId);
  });

  it('should update a task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ title: 'Updated Task', description: 'Updated', due_date: '2025-10-01' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Task');
    expect(res.body.description).toBe('Updated');
    expect(res.body.due_date).toBe('2025-10-01');
  });

  it('should preserve existing priority when PUT does not include one', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ title: 'Updated Task', description: 'Updated', due_date: '2025-10-01' });
    expect(res.status).toBe(200);
    expect(res.body.priority).toBe('P3');
  });

  it('should update priority via PUT when provided', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ title: 'Updated Task', description: 'Updated', due_date: '2025-10-01', priority: 'P2' });
    expect(res.status).toBe(200);
    expect(res.body.priority).toBe('P2');
  });

  it('should reject an invalid priority on PUT', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ title: 'Updated Task', priority: 'invalid' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Priority must be one of/);
  });

  it('should mark a task as completed', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(1);
  });

  it('should update priority via PATCH', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ priority: 'P1' });
    expect(res.status).toBe(200);
    expect(res.body.priority).toBe('P1');
    // Completed status should be unaffected by a priority-only PATCH
    expect(res.body.completed).toBe(1);
  });

  it('should reject an invalid priority on PATCH', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ priority: 'P9' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Priority must be one of/);
  });

  it('should reject a PATCH with no valid fields', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('No valid fields to update');
  });

  it('should delete a task', async () => {
    const res = await request(app).delete(`/api/tasks/${taskId}`);
    expect(res.status).toBe(204);
  });
});


import router from '@adonisjs/core/services/router'
import { middleware } from '../kernel.js'

// Task controllers
const TaskController = () => import('#controllers/tasks/task_controller')
const TasksController = () => import('#controllers/tasks/tasks_controller')
const CommentController = () => import('#controllers/tasks/comment_controller')

router
  .group(() => {
    // Tasks routes
    router.get('/tasks', [TasksController, 'index']).as('tasks.index')
    router.get('/tasks/create', [TasksController, 'create']).as('tasks.create')
    router.post('/tasks', [TasksController, 'store']).as('tasks.store')
    router.get('/tasks/:id', [TasksController, 'show']).as('tasks.show')
    router.get('/tasks/:id/edit', [TasksController, 'edit']).as('tasks.edit')
    router.put('/tasks/:id', [TasksController, 'update']).as('tasks.update')
    router.delete('/tasks/:id', [TasksController, 'destroy']).as('tasks.destroy')

    // Legacy task routes
    router.get('/task', [TaskController, 'index']).as('task.index')
    router.get('/task/create', [TaskController, 'create']).as('task.create')
    router.post('/task', [TaskController, 'store']).as('task.store')
    router.get('/task/:id', [TaskController, 'show']).as('task.show')
    router.get('/task/:id/edit', [TaskController, 'edit']).as('task.edit')
    router.put('/task/:id', [TaskController, 'update']).as('task.update')
    router.delete('/task/:id', [TaskController, 'destroy']).as('task.destroy')

    // Task comments routes
    router.post('/tasks/:task_id/comments', [CommentController, 'store']).as('task.comments.store')
    router.put('/tasks/comments/:id', [CommentController, 'update']).as('task.comments.update')
    router.delete('/tasks/comments/:id', [CommentController, 'destroy']).as('task.comments.destroy')
  })
  .use(middleware.auth())

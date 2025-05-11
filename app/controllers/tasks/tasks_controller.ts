import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ListTasks from '#actions/tasks/list_tasks'
import GetTask from '#actions/tasks/get_task'
import CreateTask from '#actions/tasks/create_task'
import UpdateTask from '#actions/tasks/update_task'
import DeleteTask from '#actions/tasks/delete_task'
import GetTaskMetadata from '#actions/tasks/get_task_metadata'

export default class TasksController {
  @inject()
  async index(
    { request, inertia }: HttpContext,
    listTasks: ListTasks,
    getTaskMetadata: GetTaskMetadata
  ) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const status = request.input('status')
    const priority = request.input('priority')
    const label = request.input('label')
    const search = request.input('search')
    const assigned_to = request.input('assigned_to')
    const filters = { page, limit, status, priority, label, search, assigned_to }
    const tasks = await listTasks.handle(filters)
    const metadata = await getTaskMetadata.handle()
    return inertia.render('tasks/index', {
      tasks,
      metadata,
      filters,
    })
  }

  @inject()
  async create({ inertia }: HttpContext, getTaskMetadata: GetTaskMetadata) {
    const metadata = await getTaskMetadata.handle()
    return inertia.render('tasks/create', { metadata })
  }

  @inject()
  async store({ request, response, session }: HttpContext, createTask: CreateTask) {
    const data = request.only([
      'title',
      'description',
      'status_id',
      'label_id',
      'priority_id',
      'assigned_to',
      'due_date',
    ])
    await createTask.handle({ data })
    session.flash('success', 'Nhiệm vụ đã được tạo thành công')
    return response.redirect().toRoute('tasks.index')
  }

  @inject()
  async show({ params, inertia }: HttpContext, getTask: GetTask) {
    const task = await getTask.handle({ id: params.id })
    return inertia.render('tasks/show', { task })
  }

  @inject()
  async edit({ params, inertia }: HttpContext, getTask: GetTask, getTaskMetadata: GetTaskMetadata) {
    const task = await getTask.handle({ id: params.id })
    const metadata = await getTaskMetadata.handle()
    return inertia.render('tasks/edit', { task, metadata })
  }

  @inject()
  async update({ params, request, response, session }: HttpContext, updateTask: UpdateTask) {
    const data = request.only([
      'title',
      'description',
      'status_id',
      'label_id',
      'priority_id',
      'assigned_to',
      'due_date',
    ])
    await updateTask.handle({ id: params.id, data })
    session.flash('success', 'Nhiệm vụ đã được cập nhật thành công')
    return response.redirect().toRoute('tasks.show', { id: params.id })
  }

  @inject()
  async destroy({ params, response, session }: HttpContext, deleteTask: DeleteTask) {
    await deleteTask.handle({ id: params.id })
    session.flash('success', 'Nhiệm vụ đã được xóa')
    return response.redirect().toRoute('tasks.index')
  }
}

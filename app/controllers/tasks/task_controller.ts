import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import Task from '../../models/task.js'
import TaskStatus from '../../models/task_status.js'
import TaskLabel from '../../models/task_label.js'
import TaskPriority from '../../models/task_priority.js'
import User from '../../models/user.js'
import CreateTask from '../../actions/tasks/create_task.js'
import UpdateTask from '../../actions/tasks/update_task.js'
import DeleteTask from '../../actions/tasks/delete_task.js'

@inject()
export default class TaskController {
  /**
   * Hiển thị danh sách task
   */
  async index({ inertia, request, auth }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const search = request.input('search', '')
    const status_id = request.input('status_id')
    const label_id = request.input('label_id')
    const priority_id = request.input('priority_id')
    const assigned_to = request.input('assigned_to')
    const onlyMine = request.input('only_mine', false)
    const tasksQuery = Task.query()
      .preload('status')
      .preload('label')
      .preload('priority')
      .preload('assignee')
      .preload('creator')
      .whereNull('deleted_at')
    if (search) {
      tasksQuery.where((query) => {
        query.whereILike('title', `%${search}%`).orWhereILike('description', `%${search}%`)
      })
    }
    if (status_id) {
      tasksQuery.where('status_id', status_id)
    }
    if (label_id) {
      tasksQuery.where('label_id', label_id)
    }
    if (priority_id) {
      tasksQuery.where('priority_id', priority_id)
    }
    if (assigned_to) {
      tasksQuery.where('assigned_to', assigned_to)
    }
    if (onlyMine) {
      tasksQuery.where((query) => {
        query.where('creator_id', auth.user!.id).orWhere('assigned_to', auth.user!.id)
      })
    }
    const tasks = await tasksQuery.orderBy('due_date', 'asc').paginate(page, limit)
    const statuses = await TaskStatus.all()
    const labels = await TaskLabel.all()
    const priorities = await TaskPriority.all()
    const users = await User.query().select(['id', 'full_name']).whereNull('deleted_at').exec()
    return inertia.render('tasks/index', {
      tasks,
      statuses,
      labels,
      priorities,
      users,
      filters: {
        search,
        status_id,
        label_id,
        priority_id,
        assigned_to,
        onlyMine,
      },
    })
  }
  /**
   * Hiển thị thông tin chi tiết task
   */
  async show({ inertia, params }: HttpContext) {
    const task = await Task.query()
      .where('id', params.id)
      .preload('status')
      .preload('label')
      .preload('priority')
      .preload('assignee')
      .preload('creator')
      .preload('comments', (query) => {
        query.preload('user').orderBy('created_at', 'asc')
      })
      .preload('versions', (query) => {
        query
          .preload('status')
          .preload('label')
          .preload('priority')
          .preload('assignee')
          .preload('changer')
          .orderBy('changed_at', 'desc')
      })
      .firstOrFail()
    return inertia.render('tasks/show', { task })
  }
  /**
   * Hiển thị form tạo task mới
   */
  async create({ inertia }: HttpContext) {
    const statuses = await TaskStatus.all()
    const labels = await TaskLabel.all()
    const priorities = await TaskPriority.all()
    const users = await User.query().select(['id', 'full_name']).whereNull('deleted_at').exec()
    return inertia.render('tasks/create', {
      statuses,
      labels,
      priorities,
      users,
    })
  }
  /**
   * Lưu task mới vào database
   */
  @inject()
  async store({ request, response, session }: HttpContext, createTask: CreateTask) {
    try {
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
      session.flash('success', 'Task đã được tạo thành công')
      return response.redirect().toRoute('tasks.index')
    } catch (error) {
      session.flash('error', error.message || 'Có lỗi xảy ra khi tạo task')
      return response.redirect().back()
    }
  }
  /**
   * Hiển thị form chỉnh sửa task
   */
  async edit({ inertia, params }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    const statuses = await TaskStatus.all()
    const labels = await TaskLabel.all()
    const priorities = await TaskPriority.all()
    const users = await User.query().select(['id', 'full_name']).whereNull('deleted_at').exec()
    return inertia.render('tasks/edit', {
      task,
      statuses,
      labels,
      priorities,
      users,
    })
  }
  /**
   * Cập nhật thông tin task
   */
  @inject()
  async update({ request, response, params, session }: HttpContext, updateTask: UpdateTask) {
    try {
      const data = request.only([
        'title',
        'description',
        'status_id',
        'label_id',
        'priority_id',
        'assigned_to',
        'due_date',
      ])
      await updateTask.handle({
        id: params.id,
        data,
      })
      session.flash('success', 'Task đã được cập nhật')
      return response.redirect().toRoute('tasks.show', { id: params.id })
    } catch (error) {
      session.flash('error', error.message || 'Có lỗi xảy ra khi cập nhật task')
      return response.redirect().back()
    }
  }
  /**
   * Xóa task (soft delete)
   */
  @inject()
  async destroy({ params, response, session }: HttpContext, deleteTask: DeleteTask) {
    try {
      await deleteTask.handle({ id: params.id })
      session.flash('success', 'Task đã được xóa')
      return response.redirect().toRoute('tasks.index')
    } catch (error) {
      session.flash('error', error.message || 'Có lỗi xảy ra khi xóa task')
      return response.redirect().back()
    }
  }
}

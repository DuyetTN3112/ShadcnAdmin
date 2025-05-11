import React, { useState } from 'react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app_layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Tasks() {
  // Mock data - trong thực tế sẽ được lấy từ props do server truyền vào
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Hoàn thành báo cáo', completed: false, priority: 'high' },
    { id: 2, title: 'Cuộc họp với khách hàng', completed: false, priority: 'medium' },
    { id: 3, title: 'Cập nhật tài liệu dự án', completed: true, priority: 'low' },
    { id: 4, title: 'Kiểm tra email', completed: true, priority: 'low' },
    { id: 5, title: 'Lên kế hoạch tuần tiếp theo', completed: false, priority: 'high' },
  ])

  const [newTask, setNewTask] = useState('')

  const handleToggleTask = (id: number) => {
    setTasks(
      tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        {
          id: tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
          title: newTask,
          completed: false,
          priority: 'medium'
        }
      ])
      setNewTask('')
    }
  }

  return (
    <>
      <Head title="Nhiệm vụ" />
      <div className="container py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Nhiệm vụ</h1>
        </div>
        
        <div className="mt-6">
          <form onSubmit={handleAddTask} className="flex items-center gap-4">
            <Input
              placeholder="Thêm nhiệm vụ mới..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Thêm</Button>
          </form>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="pending">Chưa hoàn thành</TabsTrigger>
              <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>Tất cả nhiệm vụ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks.map(task => (
                      <div 
                        key={task.id} 
                        className="flex items-center space-x-2 border-b pb-2"
                      >
                        <Checkbox 
                          id={`task-${task.id}`} 
                          checked={task.completed}
                          onCheckedChange={() => handleToggleTask(task.id)}
                        />
                        <Label 
                          htmlFor={`task-${task.id}`}
                          className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                        >
                          {task.title}
                        </Label>
                        <span 
                          className={`text-xs px-2 py-1 rounded-full ${
                            task.priority === 'high' 
                              ? 'bg-red-100 text-red-800' 
                              : task.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {task.priority === 'high' 
                            ? 'Cao' 
                            : task.priority === 'medium' 
                              ? 'Trung bình' 
                              : 'Thấp'
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Nhiệm vụ chưa hoàn thành</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks
                      .filter(task => !task.completed)
                      .map(task => (
                        <div 
                          key={task.id} 
                          className="flex items-center space-x-2 border-b pb-2"
                        >
                          <Checkbox 
                            id={`pending-${task.id}`} 
                            checked={task.completed}
                            onCheckedChange={() => handleToggleTask(task.id)}
                          />
                          <Label 
                            htmlFor={`pending-${task.id}`}
                            className="flex-1"
                          >
                            {task.title}
                          </Label>
                          <span 
                            className={`text-xs px-2 py-1 rounded-full ${
                              task.priority === 'high' 
                                ? 'bg-red-100 text-red-800' 
                                : task.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {task.priority === 'high' 
                              ? 'Cao' 
                              : task.priority === 'medium' 
                                ? 'Trung bình' 
                                : 'Thấp'
                            }
                          </span>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="completed">
              <Card>
                <CardHeader>
                  <CardTitle>Nhiệm vụ đã hoàn thành</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks
                      .filter(task => task.completed)
                      .map(task => (
                        <div 
                          key={task.id} 
                          className="flex items-center space-x-2 border-b pb-2"
                        >
                          <Checkbox 
                            id={`completed-${task.id}`} 
                            checked={task.completed}
                            onCheckedChange={() => handleToggleTask(task.id)}
                          />
                          <Label 
                            htmlFor={`completed-${task.id}`}
                            className="flex-1 line-through text-muted-foreground"
                          >
                            {task.title}
                          </Label>
                          <span 
                            className={`text-xs px-2 py-1 rounded-full ${
                              task.priority === 'high' 
                                ? 'bg-red-100 text-red-800' 
                                : task.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {task.priority === 'high' 
                              ? 'Cao' 
                              : task.priority === 'medium' 
                                ? 'Trung bình' 
                                : 'Thấp'
                            }
                          </span>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}

Tasks.layout = (page: React.ReactNode) => <AppLayout title="Nhiệm vụ">{page}</AppLayout> 
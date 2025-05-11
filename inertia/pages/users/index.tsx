import React from 'react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app_layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

export default function Users() {
  // Mock data - trong thực tế sẽ được lấy từ props do server truyền vào
  const users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', role: 'Admin' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', role: 'User' },
    { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', role: 'Editor' },
    { id: 4, name: 'Phạm Thị D', email: 'phamthid@example.com', role: 'User' },
    { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@example.com', role: 'User' },
  ]

  return (
    <>
      <Head title="Người dùng" />
      <div className="container py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Người dùng</h1>
          <Button>Thêm người dùng</Button>
        </div>
        
        <div className="mt-6 flex items-center gap-4">
          <Input 
            placeholder="Tìm kiếm người dùng..." 
            className="max-w-sm" 
          />
          <Button variant="outline">Tìm kiếm</Button>
        </div>
        
        <div className="mt-6 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="mr-2">
                      Sửa
                    </Button>
                    <Button variant="destructive" size="sm">
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}

Users.layout = (page: React.ReactNode) => <AppLayout title="Người dùng">{page}</AppLayout> 
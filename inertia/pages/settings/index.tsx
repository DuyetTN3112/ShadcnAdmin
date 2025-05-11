import React from 'react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app_layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Settings() {
  return (
    <>
      <Head title="Cài đặt" />
      <div className="container py-8">
        <h1 className="text-3xl font-bold">Cài đặt</h1>
        <p className="mt-2 text-muted-foreground">Quản lý cài đặt hệ thống và tài khoản của bạn</p>
        
        <div className="mt-8">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="account">Tài khoản</TabsTrigger>
              <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
              <TabsTrigger value="appearance">Giao diện</TabsTrigger>
              <TabsTrigger value="notifications">Thông báo</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin tài khoản</CardTitle>
                  <CardDescription>
                    Cập nhật thông tin đăng nhập và bảo mật tài khoản của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue="user@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Mật khẩu mới</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button>Lưu thay đổi</Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin hồ sơ</CardTitle>
                  <CardDescription>
                    Cập nhật thông tin cá nhân và hồ sơ công khai
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ tên</Label>
                    <Input id="name" defaultValue="Nguyễn Văn A" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input id="phone" defaultValue="+84 123 456 789" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input id="address" />
                  </div>
                  <Button>Lưu thay đổi</Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Giao diện</CardTitle>
                  <CardDescription>
                    Tùy chỉnh giao diện ứng dụng theo ý thích của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Chủ đề</Label>
                    <div className="flex space-x-4">
                      <Button variant="outline">Sáng</Button>
                      <Button variant="outline">Tối</Button>
                      <Button variant="outline">Hệ thống</Button>
                    </div>
                  </div>
                  <Button>Lưu thay đổi</Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Thông báo</CardTitle>
                  <CardDescription>
                    Quản lý cài đặt thông báo và email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tùy chọn thông báo</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="email-notifications" className="h-4 w-4" />
                        <Label htmlFor="email-notifications">Thông báo qua email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="push-notifications" className="h-4 w-4" />
                        <Label htmlFor="push-notifications">Thông báo đẩy</Label>
                      </div>
                    </div>
                  </div>
                  <Button>Lưu thay đổi</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}

Settings.layout = (page: React.ReactNode) => <AppLayout title="Cài đặt">{page}</AppLayout> 
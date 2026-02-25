// 菜单配置文件
export interface MenuItem {
  path: string
  label: string
  icon?: string
  children?: MenuItem[]
  roles?: string[] // 角色权限控制
}

export const menuConfig: MenuItem[] = [
  {
    path: '/dashboard',
    label: '首页',
    icon: 'el-icon-s-home'
  },
  {
    path: '/announcement',
    label: '公告管理',
    icon: 'el-icon-message',
    children: [
      {
        path: '/announcement/list',
        label: '公告列表'
      },
      {
        path: '/announcement/create',
        label: '发布公告'
      }
    ]
  },
  {
    path: '/message',
    label: '消息中心',
    icon: 'el-icon-bell',
    children: [
      {
        path: '/message/list',
        label: '消息列表'
      },
      {
        path: '/message/settings',
        label: '消息设置'
      }
    ]
  },
  {
    path: '/profile',
    label: '个人中心',
    icon: 'el-icon-user',
    children: [
      {
        path: '/profile',
        label: '个人信息'
      },
      {
        path: '/profile/password',
        label: '修改密码'
      }
    ]
  },
  {
    path: '/admin',
    label: '系统管理',
    icon: 'el-icon-setting',
    roles: ['admin'], // 只有管理员可以看到
    children: [
      {
        path: '/admin/users',
        label: '用户管理'
      },
      {
        path: '/admin/unverified',
        label: '未验证用户'
      },
      {
        path: '/admin/menu',
        label: '菜单配置'
      }
    ]
  }
]
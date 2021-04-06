export type MainMenuItem = {
  title?: string
  icon?: string
}

export type BladeMenuItem = {
  id: string
  title?: string
  icon?: string
}
export type BladeInfo = {
  id?: number
  title?: string
  subtitle?: string
  icon?: string
  content?: string
  component?: string
  route?: string
  menuItems?: BladeMenuItem[]
}

export type SubscriptionPlan = 'PRO'

export interface CompanyResponse {
  id: string
  name: string
  plan: SubscriptionPlan
  createdDate: string
}

export interface CompanyEntity extends CompanyResponse {}

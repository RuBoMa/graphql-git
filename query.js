export const userInfoQuery = `
query {
  user {
    id
    firstName
    lastName
    campus
    login
    auditRatio
    totalUp
    totalDown
    xps {
      amount
      path
    }
    attrs
  }
}
`;
  
export const xpQuery = `
query {
  transaction(
    where: {type: {_eq: "xp"}}
    order_by: {createdAt: desc}
    limit: 1000
  ) {
    amount
    createdAt
    path
  }
}`


export const skillsQuery = `
query {
  user {
    skills: transactions(
      order_by: [{type: desc}, {amount: desc}]
      distinct_on: [type]
      where: {type: {_like: "skill%"}}
    ) {
      type
      amount
      createdAt
    }
  }
}`
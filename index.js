import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";

const typeDefs = gql`
  type Repository {
    id: ID!
    owner: Owner
    description: String
  }

  type Owner {
    avatar_url: String
    url: String
    login: String
  }

  type UserStats {
    posts: Int
    followers: Int
    following: Int
  }

  type Query {
    repositories: [Repository]
    userStats(login: String!): UserStats
  }
`;

const resolvers = {
  Query: {
    repositories: async () => {
      const response = await fetch("https://api.github.com/repositories");
      const repos = await response.json();
      return repos.map(({ id, owner, description }) => ({
        id,
        owner: {
          avatar_url: owner.avatar_url,
          url: owner.url,
          login: owner.login,
        },
        description,
      }));
    },
    userStats: async (_, { login }) => {
      const response = await fetch(`https://api.github.com/users/${login}`);
      const user = await response.json();
      return {
        posts: user.public_repos,
        followers: user.followers,
        following: user.following,
      };
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server host at ${url}`);
});

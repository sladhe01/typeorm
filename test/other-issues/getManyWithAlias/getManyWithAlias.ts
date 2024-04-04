import "reflect-metadata"
import {
    createTestingConnections,
    closeTestingConnections,
    reloadTestingDatabases,
} from "../../utils/test-utils"
import { DataSource } from "../../../src/data-source/DataSource"
import { Category } from "./entity/Category"
import { Post } from "./entity/Post"
import { expect } from "chai"

describe("getManyWithAlias", () => {
    let connections: DataSource[]
    before(
        async () =>
            (connections = await createTestingConnections({
                entities: [__dirname + "/entity/*{.js,.ts}"],
            })),
    )
    beforeEach(() => reloadTestingDatabases(connections))
    after(() => closeTestingConnections(connections))

    it("should return entities with alias properties", () =>
        Promise.all(
            connections.map(async (connection) => {
                const category1 = new Category()
                category1.id = 1
                category1.name = "category1"

                const category2 = new Category()
                category2.id = 2
                category2.name = "category2"

                const post1 = new Post()
                post1.id = 1
                post1.title = "post1"
                post1.category = category1

                const post2 = new Post()
                post2.id = 2
                post2.title = "post2"
                post2.category = category1

                const post3 = new Post()
                post3.id = 3
                post3.title = "post3"
                post3.category = category2

                await connection.manager.save([
                    category1,
                    category2,
                    post1,
                    post2,
                    post3,
                ])

                const loadedPosts = await connection.manager
                    .createQueryBuilder(Post, "post")
                    .select("post.id", "IdOfPost")
                    .addSelect("post.title")
                    .leftJoin("post.category", "category")
                    .addSelect("category.name", "NameOfCategory")
                    .getManyWithAlias()

                loadedPosts.forEach((post) => expect(post.id).to.be.undefined)
                loadedPosts.forEach(
                    (post) => expect(post.category.name).to.be.undefined,
                )
                expect(loadedPosts).to.eql([
                    {
                        IdOfPost: 1,
                        title: "post1",
                        category: { NameOfCategory: "category1" },
                    },
                    {
                        IdOfPost: 2,
                        title: "post2",
                        category: { NameOfCategory: "category1" },
                    },
                    {
                        IdOfPost: 3,
                        title: "post3",
                        category: { NameOfCategory: "category2" },
                    },
                ])
            }),
        ))
    it("should return entities with pagination", () =>
        Promise.all(
            connections.map(async (connection) => {
                const category1 = new Category()
                category1.id = 1
                category1.name = "category1"

                const category2 = new Category()
                category2.id = 2
                category2.name = "category2"

                const post1 = new Post()
                post1.id = 1
                post1.title = "post1"
                post1.category = category1

                const post2 = new Post()
                post2.id = 2
                post2.title = "post2"
                post2.category = category1

                const post3 = new Post()
                post3.id = 3
                post3.title = "post3"
                post3.category = category2

                await connection.manager.save([
                    category1,
                    category2,
                    post1,
                    post2,
                    post3,
                ])

                const loadedPosts = await connection.manager
                    .createQueryBuilder(Post, "post")
                    .select("post.id", "IdOfPost")
                    .addSelect("post.title")
                    .leftJoin("post.category", "category")
                    .addSelect("category.name", "NameOfCategory")
                    .skip(1)
                    .take(2)
                    .getManyWithAlias()

                expect(loadedPosts).to.have.lengthOf(2)
                expect(loadedPosts).to.eql([
                    {
                        IdOfPost: 2,
                        title: "post2",
                        category: { NameOfCategory: "category1" },
                    },
                    {
                        IdOfPost: 3,
                        title: "post3",
                        category: { NameOfCategory: "category2" },
                    },
                ])
            }),
        ))
})

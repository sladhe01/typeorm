import { Entity } from "../../../../src/decorator/entity/Entity"
import { Column } from "../../../../src/decorator/columns/Column"
import { Category } from "./Category"
import { ManyToOne } from "../../../../src/decorator/relations/ManyToOne"
import { PrimaryColumn } from "../../../../src"

@Entity()
export class Post {
    @PrimaryColumn()
    id: number

    @Column()
    title: string

    @ManyToOne(() => Category, (category) => category.posts)
    category: Category
}

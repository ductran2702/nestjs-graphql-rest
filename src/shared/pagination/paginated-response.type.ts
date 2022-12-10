import { Field, Int, ObjectType } from '@nestjs/graphql';

// export function PaginatedResponse<TItem>(TItemClass: ClassType<TItem>): any {
export function PaginatedResponse<TItem>(TItemClass: any): any {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponseClass {
    @Field((type) => [TItemClass])
    nodes: TItem[];

    @Field((type) => Int)
    total: number;

    @Field((type) => Int)
    page: number;

    @Field((type) => Int)
    lastPage: number;
  }

  return PaginatedResponseClass;
}

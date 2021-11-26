import { UseGuards } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveProperty,
  Resolver,
} from '@nestjs/graphql';

import { CurrentUser } from '../shared/decorators';
import { Roles } from '../shared/decorators/roles.decorator';
import { GraphqlPassportAuthGuard } from '../shared/guards/graphql-passport-auth.guard';
import { User } from '../shared/models';
import { CatInput } from './graphql/inputs/cat-input';
import { CatQueryArgs } from './graphql/inputs/catQueryArgs.input';
import { Cat } from './graphql/types/cat.type';
import { CatsService } from './services/cats.service';
import { OwnersService } from './services/owners.service';

@Resolver('Cat')
@Resolver((_of) => Cat)
export class CatsResolver {
  constructor(
    private readonly catsService: CatsService,
    private readonly ownersService: OwnersService,
  ) {}

  @Query((_returns) => String)
  async hello(): Promise<string> {
    return 'kitty';
  }

  @Query((_returns) => Cat)
  async author(
    @Args({ name: 'id', type: () => Int }) id: number,
  ): Promise<Cat> {
    return await this.catsService.findOneById(id);
  }

  @Query((_returns) => [Cat])
  @UseGuards(GraphqlPassportAuthGuard)
  async cats(@Args() queryArgs: CatQueryArgs): Promise<any> {
    return this.catsService.query(queryArgs);
  }

  @ResolveProperty('owner')
  async owner(@Parent() cat): Promise<any> {
    const { ownerId } = cat;

    return await this.ownersService.findByUserId(ownerId);
  }

  @Roles('user')
  @UseGuards(new GraphqlPassportAuthGuard('USER'))
  @Mutation((_returns) => Cat)
  @UseGuards(GraphqlPassportAuthGuard)
  async createCat(
    @Args('input') input: CatInput,
    @CurrentUser() currentUser: User,
  ): Promise<Cat> {
    return this.catsService.create(input, currentUser);
  }
}

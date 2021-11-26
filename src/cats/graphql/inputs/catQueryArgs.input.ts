import { ArgsType, Field } from '@nestjs/graphql';

import { FilterByGeneric, OrderByGeneric } from '../../../shared/graphql/types';
import { CatFields } from '../enums/catFields.enum';

const FilterByCatFields = FilterByGeneric(CatFields, 'CatFields');
const OrderByCatFields = OrderByGeneric(CatFields, 'CatFields');
type FilterByCatFields = InstanceType<typeof FilterByCatFields>;
type OrderByCatFields = InstanceType<typeof OrderByCatFields>;

@ArgsType()
export class CatQueryArgs {
  @Field((type) => [FilterByCatFields], { nullable: true })
  filterBy?: FilterByCatFields[];

  @Field((type) => [OrderByCatFields], { nullable: true })
  orderBy?: OrderByCatFields[];
}

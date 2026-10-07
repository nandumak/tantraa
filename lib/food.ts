export type Food = {id:string;title:string;quantity:number;source:string;location:string;distance:string;diet:string;window:string;status:string;emoji:string;color:string;deadline?:string;notes?:string};
export const sampleFood:Food[]=[
 {id:'sample-meals',title:'Fresh meal boxes',quantity:35,source:'The Green Table · Restaurant',location:'College Junction, Kannur',distance:'2.4 km',diet:'Vegetarian',window:'45 min',status:'Available',emoji:'🍱',color:'peach'},
 {id:'sample-veg',title:'Wholesome vegetarian meals',quantity:20,source:'Community Kitchen · Event',location:'Town Hall, Kannur',distance:'1.8 km',diet:'Vegetarian',window:'30 min',status:'Pickup soon',emoji:'🥗',color:'mint'},
 {id:'sample-bread',title:'Freshly baked goodness',quantity:18,source:'Morning Crumb · Bakery',location:'Market Road, Kannur',distance:'0.8 km',diet:'Vegetarian',window:'20 min',status:'Urgent',emoji:'🥐',color:'yellow'},
 {id:'sample-rice',title:'Rice & chicken meal boxes',quantity:24,source:'Together Events · Caterer',location:'Community Centre, Kannur',distance:'3.1 km',diet:'Non-vegetarian',window:'60 min',status:'Available',emoji:'🍛',color:'lilac'}
];
export type Activity={id:string;kind:string;ref:string;title:string;quantity:number;location:string;diet:string;deadline:string|null;notes:string;status:string;created_at:string};

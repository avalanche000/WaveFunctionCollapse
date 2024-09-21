import * as UTILS from "utils";

class Pizza extends UTILS.Observable {
  constructor(toppings, slices) {
    super("slices");

    this.toppings = toppings;
    this.slices = slices;
  }
}

const pizza1 = new Pizza(["cheese", "green peppers"], 8);

console.log(pizza1.toppings, pizza1.slices);

pizza1.subscribe("slices", (slices) =>
  console.log("you changed the slices to " + slices)
);

const unsub = pizza1.subscribe("slices", (slices) => console.log("WHAT " + slices + " SLICES"));

pizza1.slices = 5;

unsub();

pizza1.slices = 2;

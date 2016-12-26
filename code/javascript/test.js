"use strict";

var p = {
  x: 1.0,
  y: 1.0,
  长度: 1,
  $c: 5,

  get c() {
    return this.$c;
  },
  set c(value) {
    this.$c = value;
  },

  get r() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  },
  set r(newValue) {
    var oldValue = this.r;
    var ratio = newValue / oldValue;
    this.x *= ratio;
    this.y *= ratio;
  },

  get θ() {
    return Math.atan2(this.y, this.x);
  }
};

console.log("p.c", p.c);
console.log("p.$c", p.$c);
p.r = 2;
console.log("p.r", p.r);
console.log("p.θ", p.θ);
console.log("p.长度", p.长度);

var 变量 = 2;
console.log(变量 * p.长度);

console.log("π", "π".length);
console.log("e", "e".length);

out: for (var i = 0; i < 10; i++) {
  for (var j = 0; j < 10; j++) {
    if (i > 4 && j > 5) {
      break out;
    }
  }
}

function inherit(p) {
  if (p == null) throw TypeError();
  if (Object.create) return Object.create(p);
  var t = typeof p;
  if (t !== "object" && t !== "function") throw TypeError();
  var f = function () {
  };
  f.prototype = p;
  return new f();
}

var x = {u: undefined};
console.log(JSON.stringify(x), x);

console.log(Object.getOwnPropertyDescriptor(p, "c"));

console.log(new Date().toJSON());

var a = [1, 2, 3];
a[-1.23] = 4;
a["10"] = 0;
a[1.000] = "6";
a[1.0001] = "7";
console.log(a.length, JSON.stringify(a), a);

console.log(Array.prototype.map.call({"0": "a", "1": "b", "2": "c", length: 3}, function (x) {
  return x.toUpperCase();
}));


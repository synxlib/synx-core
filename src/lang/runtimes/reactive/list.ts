import { ListInstruction } from "@/lang/extensions/list";
import { handleReactive, isSignal, withReactive } from "./reactive-helpers";
import { run } from "./run";
import { flatMap } from "@/lang/extensions/helpers";
import { pure } from "@/lang/extensions/freer";

export function runListInstruction<A>(instr: ListInstruction<A>): A {
    switch (instr.tag) {
        case "Concat": {
            return run(
                handleReactive([instr.value, instr.list], (value, list) => {
                    console.log("Concat:", value, list, [...list, value]);
                    return instr.next([...list, value]);
                }),
            );
        }
        case "Join": {
            // return run(
            //     flatMap(instr.list, (listVal) =>
            //         flatMap(instr.str, (val) =>
            //             isSignal(listVal)
            //                 ? (withReactive(listVal, (reactiveList) => {
            //                       console.log("Reactive List", reactiveList);
            //                       return run(
            //                           instr.next(reactiveList.join(val)),
            //                       );
            //                   }),
            //                   pure(undefined))
            //                 : instr.next(listVal.join(val)),
            //         ),
            //     ),
            // );
            console.log("Join", instr.list);
            return run(
                handleReactive([instr.str, instr.list], (str, list) => {
                    console.log("Join:", str, list);
                    return instr.next(list.join(str));
                }),
            );
        }
    }
}


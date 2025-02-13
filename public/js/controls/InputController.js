export class InputController {
    constructor(scene) {
        this.inputMap = {};
        this.setupInputs(scene);
    }

    setupInputs(scene) {
        scene.actionManager = new BABYLON.ActionManager(scene);
        
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnKeyDownTrigger,
                (evt) => this.inputMap[evt.sourceEvent.key] = true
            )
        );
        
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnKeyUpTrigger,
                (evt) => this.inputMap[evt.sourceEvent.key] = false
            )
        );
    }

    isKeyPressed(key) {
        return this.inputMap[key] === true;
    }

    clearKey(key) {
        this.inputMap[key] = false;
    }
}

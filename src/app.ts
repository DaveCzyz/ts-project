interface Project {
    id: number,
    title: string,
    description: string,
    people: number
}

class ProjectState {
    private static instance: ProjectState;
    private projects: Project[] = [];
    private id = 1;

    private constructor() {}

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        return this.instance = new ProjectState();
    }

    increment(): void {
        this.id++;
    }

    addProject(project: Partial<Project>) {
        const newProj = {
            id: this.id,
            ...project
        };

        this.projects.push(newProj as Project);
        this.increment();
    }
}

const projectState = ProjectState.getInstance();

interface Validatable {
    value: string | number,
    required?: boolean,
    minLength?: number;
    maxLength?: number,
    min?: number,
    max?: number,
}

function validate(input: Validatable): boolean {
    let isValid = true;

    if (input.required) {
        isValid = isValid && input.value.toString().trim().length !== 0;
    }

    if (input.minLength && typeof input.value === 'string') {
        isValid = isValid && input.value.trim().length >= input.minLength;
    }

    if (input.maxLength && typeof input.value === 'string') {
        isValid = isValid && input.value.trim().length <= input.maxLength;
    }

    if (input.min && typeof input.value === 'number') {
        isValid = isValid && input.value >= input.min;
    }

    if (input.max && typeof input.value === 'number') {
        isValid = isValid && input.value <= input.max;
    }

    return isValid;
}

class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;

    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);

        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${type}-projects`;

        this.attach();
        this.renderContent();
    }

    private renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
}

class ProjectInput {
    // <template id="project-input">
    templateElement: HTMLTemplateElement;

    // <div id="app">
    hostElement: HTMLDivElement;

    // <form>
    element: HTMLFormElement;

    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);

        this.element = importedNode.firstElementChild as HTMLFormElement;

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
        this.attach();
    }

    private getValues() : [string, string, number] | void {
        const title = this.titleInputElement.value;
        const description = this.descriptionInputElement.value;
        const people = this.peopleInputElement.value;

        const titleRules: Validatable = {
            value: title,
            required: true,
            minLength: 3,
            maxLength: 255
        }

        const descriptionRules: Validatable = {
            value: description,
            required: true,
            minLength: 3,
            maxLength: 255
        }

        const peopleRules: Validatable = {
            value: +people,
            required: true,
            min: 1,
            max: 10
        }

        if (
            !validate(titleRules) ||
            !validate(descriptionRules) ||
            !validate(peopleRules)
        ) {
            alert('Invalid input!');
            return;
        }

        return [title, description, +people]
    }

    private clearForm() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    private submitHandler(event: Event) {
        event.preventDefault();
        const inputs = this.getValues();

        if (Array.isArray(inputs)) {
            const [title, description, people] = inputs;

            projectState.addProject({
                title,
                description,
                people
            });

            this.clearForm();
        }
    }

    private configure() {
        this.element.addEventListener('submit', this.submitHandler.bind(this));
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const p = new ProjectInput();
const l = new ProjectList('active');
const l2 = new ProjectList('finished');
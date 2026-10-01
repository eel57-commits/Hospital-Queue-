#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

// --- DSA: Linked List Queue Implementation ---
typedef struct Patient {
    int id;
    char name[100];
    char issue[100];
    char timeAdded[50];
    struct Patient* next;
} Patient;

Patient* front = NULL;
Patient* rear = NULL;
int nextId = 1;

void enqueue(const char* name, const char* issue) {
    Patient* newPatient = (Patient*)malloc(sizeof(Patient));
    newPatient->id = nextId++;
    
    strncpy(newPatient->name, name, sizeof(newPatient->name) - 1);
    newPatient->name[sizeof(newPatient->name) - 1] = '\0'; // ensure null termination
    
    strncpy(newPatient->issue, issue, sizeof(newPatient->issue) - 1);
    newPatient->issue[sizeof(newPatient->issue) - 1] = '\0';
    
    time_t t = time(NULL);
    struct tm *tm_info = localtime(&t);
    strftime(newPatient->timeAdded, 50, "%I:%M:%S %p", tm_info);
    
    newPatient->next = NULL;
    
    if (rear == NULL) {
        front = rear = newPatient;
        return;
    }
    rear->next = newPatient;
    rear = newPatient;
}

Patient* dequeue() {
    if (front == NULL) return NULL;
    Patient* temp = front;
    front = front->next;
    if (front == NULL) rear = NULL;
    return temp;
}

// Print queue as JSON for the Node.js wrapper to consume
void printQueueJSON() {
    printf("[");
    Patient* current = front;
    while (current != NULL) {
        printf("{\"id\":%d, \"name\":\"%s\", \"issue\":\"%s\", \"timeAdded\":\"%s\"}", 
               current->id, current->name, current->issue, current->timeAdded);
        if (current->next != NULL) {
            printf(",");
        }
        current = current->next;
    }
    printf("]\n");
}

// --- Main CLI Event Loop ---
// This acts as our "Backend Process". It listens for commands via Standard Input.
int main() {
    char command[256];
    
    // Disable output buffering so Node.js receives data immediately
    setvbuf(stdout, NULL, _IONBF, 0);

    while (fgets(command, sizeof(command), stdin)) {
        // Strip newline
        command[strcspn(command, "\r\n")] = 0;
        
        if (strncmp(command, "ENQUEUE ", 8) == 0) {
            // Format expected: ENQUEUE Name|Issue
            char* data = command + 8;
            char* separator = strchr(data, '|');
            if (separator != NULL) {
                *separator = '\0';
                char* name = data;
                char* issue = separator + 1;
                enqueue(name, issue);
                printf("{\"status\":\"success\", \"message\":\"Enqueued\"}\n");
            } else {
                printf("{\"status\":\"error\", \"message\":\"Invalid format\"}\n");
            }
        } 
        else if (strcmp(command, "DEQUEUE") == 0) {
            Patient* p = dequeue();
            if (p != NULL) {
                printf("{\"status\":\"success\", \"patient\": {\"id\":%d, \"name\":\"%s\", \"issue\":\"%s\", \"timeAdded\":\"%s\"}}\n",
                       p->id, p->name, p->issue, p->timeAdded);
                free(p);
            } else {
                printf("{\"status\":\"error\", \"message\":\"Queue is empty\"}\n");
            }
        }
        else if (strcmp(command, "GET_QUEUE") == 0) {
            printQueueJSON();
        }
        else if (strcmp(command, "EXIT") == 0) {
            break;
        }
        else {
            printf("{\"status\":\"error\", \"message\":\"Unknown command\"}\n");
        }
    }
    
    return 0;
}

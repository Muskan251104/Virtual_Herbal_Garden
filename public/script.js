// document.addEventListener('DOMContentLoaded', function () {
//   // Initialize the Bootstrap carousel
//   var carouselElement = document.querySelector("#carouselExampleControls");

//   var carousel = new bootstrap.Carousel(carouselElement, {
//     interval: 5000, // Change slide every 5 seconds
//     wrap: true      // Infinite loop
//   });
//   // ====================================TRY 
//   // Bookmark functionality
//   document.querySelectorAll('.bookmark-icon').forEach(icon => {
//     icon.addEventListener('click', function(e) {
//       e.preventDefault();
//       const plantId = this.getAttribute('data-plant-id');
//       const bookmarkIcon = this.querySelector('i');

//       fetch('/toggle-bookmark', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ plantId: plantId }),
//       })
//       .then(response => response.json())
//       .then(data => {
//         if (data.success) {
//           bookmarkIcon.classList.toggle('bookmarked');
//         } else {
//           alert('Error toggling bookmark. Please try again.');
//         }
//       })
//       .catch(error => {
//         console.error('Error:', error);
//       });
//     });
//   });
//   // TRY END================================
// });

// document.addEventListener('DOMContentLoaded', () => {
//   const noteForm = document.getElementById('note-form');
//   const noteText = document.getElementById('noteText');
//   const noteList = document.getElementById('note-list');

//   noteForm.addEventListener('submit', function(event) {
//     event.preventDefault(); // Prevent the form from submitting normally

//     const noteContent = noteText.value.trim();

//     if (!noteContent) {
//       alert("Note cannot be empty!");
//       return;
//     }

//     // Send an AJAX request to save the note
//     fetch('/notes', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ noteText: noteContent }), // Send note text in JSON format
//     })
//     .then(response => response.json())
//     .then(data => {
//       if (data.success) {
//         // Add the new note to the DOM
        
//         const newNoteItem = document.createElement('li');
//         newNoteItem.innerHTML = ${data.note.text} <button class="delete-note" data-id="${data.note._id}">Delete</button>;
//         noteList.appendChild(newNoteItem);
//         noteText.value = ''; // Clear the textarea
        
//       } else {
//         alert("Error saving note. Please try again.");
//       }
//     })
//     .catch(error => {
//       console.error('Error:', error);
//     });
//   });

//   // Add event listener for the delete buttons dynamically
//   noteList.addEventListener('click', function(event) {
//     if (event.target.classList.contains('delete-note')) {
//       const noteId = event.target.getAttribute('data-id');
      
//       // Send an AJAX request to delete the note
//       fetch(/delete-note/${noteId}, {
//         method: 'POST',
//       })
//       .then(response => response.json())
//       .then(data => {
//         if (data.success) {
//           // Remove the note from the DOM
//           event.target.parentElement.remove();
//         } else {
//           alert("Error deleting note.");
//         }
//       })
//       .catch(error => {
//         console.error('Error:', error);
//       });
//     }
//   });
// });


document.addEventListener('DOMContentLoaded', function () {
  // Bookmark functionality
  document.querySelectorAll('.bookmark-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
      e.preventDefault();
      const plantId = this.getAttribute('data-plant-id');
      const bookmarkIcon = this;

      fetch('/toggle-bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plantId: plantId }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          bookmarkIcon.classList.toggle('fas');
          bookmarkIcon.classList.toggle('far');
          bookmarkIcon.style.color = bookmarkIcon.classList.contains('fas') ? 'red' : 'black';
        } else {
          console.error('Server responded with an error:', data.message);
          alert('Error toggling bookmark: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error toggling bookmark. Please try again.');
      });
    });
  });

  // Note functionality
  const noteForm = document.getElementById('note-form');
  const noteText = document.getElementById('noteText');
  const noteList = document.getElementById('note-list');

  if (noteForm) {
    noteForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const noteContent = noteText.value.trim();

      if (!noteContent) {
        alert("Note cannot be empty!");
        return;
      }

      fetch('/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ noteText: noteContent }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          const newNoteItem = document.createElement('li');
          newNoteItem.innerHTML = `${data.note.text} <button class="delete-note" data-id="${data.note._id}">Delete</button>`;
          noteList.appendChild(newNoteItem);
          noteText.value = '';
        } else {
          console.error('Server responded with an error:', data.message);
          alert("Error saving note: " + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert("Error saving note. Please try again.");
      });
    });
  }

  if (noteList) {
    noteList.addEventListener('click', function(event) {
      if (event.target.classList.contains('delete-note')) {
        const noteId = event.target.getAttribute('data-id');

        fetch(`/delete-note/${noteId}`, {
          method: 'POST',
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            event.target.parentElement.remove();
          } else {
            console.error('Server responded with an error:', data.message);
            alert("Error deleting note: " + data.message);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert("Error deleting note. Please try again.");
        });
      }
    });
  }

  // Search functionality
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');

  if (searchForm) {
    searchForm.addEventListener('submit', function(event) {
      event.preventDefault();
      const searchQuery = searchInput.value.trim();
      if (searchQuery) {
        window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
      }
    });
  }

  // Category filter functionality
  const categoryLinks = document.querySelectorAll('.category-link');
  categoryLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const category = this.getAttribute('data-category');
      window.location.href = `/category/${encodeURIComponent(category)}`;
    });
  });
});
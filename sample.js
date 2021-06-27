function destroy() {
  if (network !== null) {
    network.destroy();
    network = null;
  }
}

function draw() {
  destroy();
  nodes = [];
  edges = [];
  // create a network
  var container = document.getElementById("mynetwork");
  var options = {
    manipulation: {
      addNode: function(data, callback) {
        // filling in the popup DOM elements
        document.getElementById("operation").innerHTML = "Add Node";
        document.getElementById("node-id").value = data.id;
        document.getElementById("node-label").value = data.label;
        document.getElementById("saveButton").onclick = saveData.bind(
          this,
          data,
          callback
        );
        document.getElementById("cancelButton").onclick = clearPopUp.bind();
        document.getElementById("network-popUp").style.display = "block";
      },
      editNode: function(data, callback) {
        // filling in the popup DOM elements
        document.getElementById("operation").innerHTML = "Edit Node";
        document.getElementById("node-id").value = data.id;
        document.getElementById("node-label").value = data.label;
        document.getElementById("saveButton").onclick = saveData.bind(
          this,
          data,
          callback
        );
        document.getElementById("cancelButton").onclick = cancelEdit.bind(
          this,
          callback
        );
        document.getElementById("network-popUp").style.display = "block";
      },
      addEdge: function(data, callback) {
        if (data.from == data.to) {
          var r = confirm("Do you want to connect the node to itself?");
          if (r == true) {
            callback(data);
          }
        } else {
          callback(data);
        }
      }
    }
  };
  network = new vis.Network(container, data, options);
}

function clearPopUp() {
  document.getElementById("saveButton").onclick = null;
  document.getElementById("cancelButton").onclick = null;
  document.getElementById("network-popUp").style.display = "none";
}

function cancelEdit(callback) {
  clearPopUp();
  callback(null);
}

function saveData(data, callback) {
  data.id = document.getElementById("node-id").value;
  data.label = document.getElementById("node-label").value;
  clearPopUp();
  callback(data);
}
var network = null;
var node_init = [
  {
    id: 1,
    label: "Node 1"
  },
  {
    id: 2,
    label: "Node 2"
  },
  {
    id: 3,
    label: "Node 3"
  },
  {
    id: 4,
    label: "Node 4"
  },
  {
    id: 5,
    label: "Node 5"
  }
];

var edge_init = [
  {
    from: 1,
    to: 3
  },
  {
    from: 1,
    to: 2
  },
  {
    from: 2,
    to: 4
  },
  {
    from: 2,
    to: 5
  },
  {
    from: 3,
    to: 3
  }
];

var nodes = new vis.DataSet(node_init);
var edges = new vis.DataSet(edge_init);

// create a network
var data = {
  nodes: nodes,
  edges: edges
};

// let NUM = 10;
// $("#button1").on("click", function() {
//   data.nodes.add({
//     id: NUM,
//     label: "Node" + NUM
//   });
//   NUM = NUM + 1;
// });

////////////////////////////////////////
// undo/redo functions
////////////////////////////////////////

//initialize
let history_list_back = [];
let history_list_forward = [];

// initial data
history_list_back.push({
  nodes_his: data.nodes.get(data.nodes.getIds()),
  edges_his: data.edges.get(data.edges.getIds())
});
// event on
data.nodes.on("*", change_history_back);
data.edges.on("*", change_history_back);

function change_history_back() {
  history_list_back.unshift({
    nodes_his: data.nodes.get(data.nodes.getIds()),
    edges_his: data.edges.get(data.edges.getIds())
  });
  //reset forward history
  history_list_forward = [];
  // apply css
  css_for_undo_redo_chnage();
}
function redo_css_active() {
  $("#button_undo").css({
    "background-color": "inherit",
    color: "#878787",
    cursor: "pointer"
  });
};
function undo_css_active() {
  $("#button_redo").css({
    "background-color": "inherit",
    color: "#878787",
    cursor: "pointer"
  });
};

function redo_css_inactive() {
  $("#button_undo").css({
    "background-color": "inherit",
    color: "#EBEBEB",
    cursor: "inherit"
  });
};

function undo_css_inactive() {
  $("#button_redo").css({
    "background-color": "inherit",
    color: "#EBEBEB",
    cursor: "inherit"
  });
};

function css_for_undo_redo_chnage() {
  if (history_list_back.length === 1) {
    redo_css_inactive();
  } else {
    redo_css_active();
  };
  if (history_list_forward.length === 0) {
    undo_css_inactive();
  } else {
    undo_css_active();
  };
};

$(document).ready(function() {
              // apply css
  css_for_undo_redo_chnage();
});

$("#button_undo").on("click", function() {
  if (history_list_back.length > 1) {
    const current_nodes = data.nodes.get(data.nodes.getIds());
    const current_edges = data.edges.get(data.edges.getIds());
    const previous_nodes = history_list_back[1].nodes_his;
    const previous_edges = history_list_back[1].edges_his;
    // event off
    data.nodes.off("*", change_history_back);
    data.edges.off("*", change_history_back);
    // undo without events
    if (current_nodes.length > previous_nodes.length) {
      const previous_nodes_diff = _.differenceBy(
        current_nodes,
        previous_nodes,
        "id"
      );
      data.nodes.remove(previous_nodes_diff);
    } else {
      data.nodes.update(previous_nodes);
    }

    if (current_edges.length > previous_edges.length) {
      const previous_edges_diff = _.differenceBy(
        current_edges,
        previous_edges,
        "id"
      );
      data.edges.remove(previous_edges_diff);
    } else {
      data.edges.update(previous_edges);
    }
    // recover event on
    data.nodes.on("*", change_history_back);
    data.edges.on("*", change_history_back);

    history_list_forward.unshift({
      nodes_his: history_list_back[0].nodes_his,
      edges_his: history_list_back[0].edges_his
    });
    history_list_back.shift();
            // apply css
    css_for_undo_redo_chnage();
  }
});

$("#button_redo").on("click", function() {
  if (history_list_forward.length > 0) {
    const current_nodes = data.nodes.get(data.nodes.getIds()); 
    const current_edges = data.edges.get(data.edges.getIds());
    const forward_nodes = history_list_forward[0].nodes_his; 
    const forward_edges = history_list_forward[0].edges_his; 
    // event off
    data.nodes.off("*", change_history_back);
    data.edges.off("*", change_history_back);
    // redo without events
    if (current_nodes.length > forward_nodes.length) {
      const forward_nodes_diff = _.differenceBy(
        current_nodes,
        forward_nodes,
        "id"
      );
      data.nodes.remove(forward_nodes_diff);
    } else {
      data.nodes.update(forward_nodes);
    }
    if (current_edges.length > forward_edges.length) {
      const forward_edges_diff = _.differenceBy(
        current_edges,
        forward_edges,
        "id"
      );
      data.edges.remove(forward_edges_diff);
    } else {
      data.edges.update(forward_edges);
    }
    // recover event on
    data.nodes.on("*", change_history_back);
    data.edges.on("*", change_history_back);
    history_list_back.unshift({
      nodes_his: history_list_forward[0].nodes_his,
      edges_his: history_list_forward[0].edges_his
    });
    // history_list_forward
    history_list_forward.shift();
        // apply css
    css_for_undo_redo_chnage();
  }
});

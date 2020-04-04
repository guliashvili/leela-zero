
#include "../Simple-Web-Server/server_http.hpp"
#include <future>

// Added for the json-example
#define BOOST_SPIRIT_THREADSAFE

#include <boost/property_tree/json_parser.hpp>
#include <boost/property_tree/ptree.hpp>

// Added for the default_resource example
#include <algorithm>
#include <boost/filesystem.hpp>
#include <fstream>
#include <vector>

#ifdef HAVE_OPENSSL
#include "crypto.hpp"
#endif

using namespace std;
// Added for the json-example:
using namespace boost::property_tree;
#include   "Training.h"
#include <nlohmann/json.hpp>

// for convenience
using json = nlohmann::json;

#include "config.h"

#include <boost/program_options.hpp>
#include <memory>
#include <string>
#include "LeelaHelper.h"
#include "GTP.h"

using namespace Utils;

using HttpServer = SimpleWeb::Server<SimpleWeb::HTTP>;

int main(int argc, char *argv[]) {
  HttpServer server;
  server.config.port = 1999;
  server.resource["^/json$"]["POST"] = [argc, argv](shared_ptr<HttpServer::Response> response,
                                                    shared_ptr<HttpServer::Request> request) {

      static auto game = init(argc, argv);
      std::cerr << "starteed "<<request->content.string() << std::endl;
      Training::clear_training();
      game->reset_game();

      try {
        auto j3 = json::parse(request->content);
        bool isBlack = false;
        for (const auto &move : j3.at("moves")) {
          const auto x = move.at("x").get<int>();
          const auto y = move.at("y").get<int>();
          isBlack = move.at("isBlack").get<bool>();

          const auto vertex = game->board.get_vertex(x, y);
          game->play_move((int) !isBlack, vertex);
        }
        const auto commandSpec = j3.at("commandSpec");
        const auto command = commandSpec.at("command").get<string>();
        if(true) // command ===
        {
          GTP::execute(*game, "genmove " +  (game->board.black_to_move() ? string("b") : string("w")));
        }
        const auto [x,y]  = game->board.get_xy(game->get_last_move());
        const auto answer = json({{"move", {{"x", x}, {"y", y}, {"isBlack", !isBlack}}}}).dump();
        *response << "HTTP/1.1 200 OK\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: " << answer.length() << "\r\n\r\n"
                  << answer;
      }
      catch (const exception &e) {
        std::cerr<<e.what()<<std::endl;
        response->write(SimpleWeb::StatusCode::client_error_bad_request, e.what());
      }
  };
  promise<unsigned short> server_port;
  thread server_thread([&server, &server_port]() {
      // Start server
      server.start([&server_port](unsigned short port) {
          server_port.set_value(port);
      });
  });
  server_thread.join();

  return 0;

}

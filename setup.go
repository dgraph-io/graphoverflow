/*
 * Copyright 2018 Dgraph Labs, Inc. and Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/dgraph-io/graphoverflow/internal/comments"
)

var (
	datadir = flag.String("datadir", "data", "Directory which holds data XML files.")
)

var pathExe7z string

func check(err error) {
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func getFilesByFunc(dir string, f func(string) bool) ([]string, error) {
	var files []string
	err := filepath.Walk(dir, func(path string, fi os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !fi.IsDir() && f(path) {
			files = append(files, path)
		}
		return nil
	})
	return files, err
}

func extractTo(file, dir string) error {
	fmt.Println("extractTo:", pathExe7z, file, dir)
	cmd := exec.Command(pathExe7z, "x", "-o"+dir, file)
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func loadRDF(file string) error {
	base := strings.ToLower(filepath.Base(file))
	switch base {
	case "comments.xml":
		return comments.Load(file)
	default:
		fmt.Fprintf(os.Stderr, "Dont know how to load %q!\n", file)
	}
	return nil
}

func main() {
	flag.Parse()

	if *datadir == "" {
		flag.Usage()
		check(fmt.Errorf("Must set the path to data with -datadir."))
	}

	tmpDir, err := ioutil.TempDir("", "graphoverflow")
	check(err)
	fmt.Println("tmpDir:", tmpDir)
	defer os.RemoveAll(tmpDir)

	// get list of all data files (.7z)
	dataFiles, err := getFilesByFunc(*datadir, func(name string) bool {
		return strings.HasSuffix(name, ".stackexchange.com.7z")
	})
	if len(dataFiles) == 0 {
		check(fmt.Errorf("No data files found in %q", *datadir))
	}
	check(err)
	fmt.Println(dataFiles)

	for _, dataFile := range dataFiles {
		dir := filepath.Join(tmpDir, filepath.Base(dataFile))
		check(os.Mkdir(dir, 0700))
		// extract archive of XML files into our tmp dir.
		check(extractTo(dataFile, dir))

		xmlFiles, err := getFilesByFunc(dir, func(name string) bool {
			return strings.HasSuffix(name, ".xml")
		})
		if len(xmlFiles) == 0 {
			check(fmt.Errorf("No xml extracted from %q", dataFile))
		}
		check(err)
		fmt.Println(xmlFiles)

		for _, xmlFile := range xmlFiles {
			loadRDF(xmlFile)
		}
	}
}

func init() {
	p, err := exec.LookPath("7z")
	if err != nil {
		log.Fatal("The 7z executable was not found in path.")
	}
	pathExe7z = p
}
